import databaseService from '~/services/database.service'
import usersService from '~/services/users.services'
import { ParamSchema, checkSchema } from 'express-validator'
import { USER_MESSAGES } from '~/constants/message'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { ErrorWithStatus } from '~/models/Errors'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize, concat } from 'lodash'
import { NextFunction, Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { TokenPayLoad } from '~/models/request/User.request'
import { UserVerifyStatus } from '~/constants/enum'
import { REGEX_USERNAME } from '~/constants/regex'

const passwordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGES.PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_A_STRING
  },
  trim: true,
  isStrongPassword: {
    options: { minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 },
    errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_STRONG
  }
}

const confirmPasswordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
  },
  trim: true,
  custom: {
    options: (value, { req }) => {
      if (req.body.password !== value) throw new Error(USER_MESSAGES.PASSWORD_CONFIRMATION_DOES_NOT_MATCH_PASSWORD)
      return true
    }
  }
}

const forgotPasswordSchema: ParamSchema = {
  trim: true,
  custom: {
    options: async (value, { req }) => {
      if (!value)
        throw new ErrorWithStatus({
          message: USER_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED,
          status: HTTP_STATUS.UNAUTHORIZED
        })
      try {
        const decodedForgotPasswordToken = await verifyToken({
          token: value,
          secretOrPublicKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
        })
        const { userId } = decodedForgotPasswordToken
        const user = await databaseService.users.findOne({ _id: new ObjectId(userId) })
        if (!user) {
          throw new ErrorWithStatus({
            message: USER_MESSAGES.USER_NOT_FOUND,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        if (user.forgot_password_token !== value) {
          throw new ErrorWithStatus({
            message: USER_MESSAGES.FORGOT_PASSWORD_TOKEN_INVALID,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        req.decodedForgotPasswordToken = decodedForgotPasswordToken
      } catch (error) {
        if (error instanceof JsonWebTokenError) {
          throw new ErrorWithStatus({
            message: USER_MESSAGES.REFRESH_TOKEN_IS_INVALID,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
        throw error
      }
      return true
    }
  }
}

const nameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGES.NAME_IS_REQUIRED
  },
  isString: {
    errorMessage: USER_MESSAGES.NAME_MUST_BE_A_STRING
  },
  isLength: { options: { min: 3, max: 100 } },
  trim: true,
  errorMessage: USER_MESSAGES.NAME_MUST_BE_FROM_3_TO_100_CHARACTERS
}

const dateOfBirthSchema: ParamSchema = {
  isISO8601: {
    options: {
      strict: true,
      strictSeparator: true
    }
  },
  errorMessage: USER_MESSAGES.DATE_OF_BIRTH_MUST_BE_ISO8601
}

const imageSchema: ParamSchema = {
  optional: true,
  isString: {
    errorMessage: USER_MESSAGES.IMAGE_URL_MUST_BE_A_STRING
  },
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 400
    },
    errorMessage: USER_MESSAGES.IMAGE_URL_LENGTH
  }
}

export const loginValidator = checkSchema(
  {
    email: {
      notEmpty: {
        errorMessage: USER_MESSAGES.EMAIL_IS_REQUIRED
      },
      isEmail: {
        errorMessage: USER_MESSAGES.EMAIL_IS_INVALID
      },
      trim: true,
      custom: {
        options: async (value, { req }) => {
          const user = await databaseService.users.findOne({ email: value, password: hashPassword(req.body.password) })
          if (user === null) throw new Error(USER_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT)
          req.user = user
          return true
        }
      }
    },
    password: {
      notEmpty: {
        errorMessage: USER_MESSAGES.PASSWORD_IS_REQUIRED
      }
    }
  },
  ['body']
)

export const registerValidator = checkSchema(
  {
    name: nameSchema,
    email: {
      notEmpty: {
        errorMessage: USER_MESSAGES.EMAIL_IS_REQUIRED
      },
      isEmail: {
        errorMessage: USER_MESSAGES.EMAIL_IS_INVALID
      },
      trim: true,
      custom: {
        options: async (value) => {
          const isExist = await usersService.checkEmailExist(value)
          if (isExist) throw new Error(USER_MESSAGES.EMAIL_ALREADY_EXISTS)
          return true
        }
      }
    },
    password: passwordSchema,
    confirm_password: confirmPasswordSchema,
    dateOfBirth: dateOfBirthSchema
  },
  ['body']
)

export const accessTokenValidator = checkSchema(
  {
    authorization: {
      trim: true,
      custom: {
        options: async (value: string, { req }) => {
          if (!value) {
            throw new ErrorWithStatus({
              message: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
              status: HTTP_STATUS.UNAUTHORIZED
            })
          }
          const accessToken = value.split('Bearer ')[1]
          if (!accessToken)
            throw new ErrorWithStatus({
              message: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
              status: HTTP_STATUS.UNAUTHORIZED
            })
          try {
            const decodedAuthorization = await verifyToken({
              token: accessToken,
              secretOrPublicKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
            })
            ;(req as Request).decodedAuthorization = decodedAuthorization
          } catch (error) {
            throw new ErrorWithStatus({
              message: 'AccessToken ' + (error as JsonWebTokenError).message,
              status: HTTP_STATUS.UNAUTHORIZED
            })
          }
          return true
        }
      }
    }
  },
  ['headers']
)

export const refreshTokenValidator = checkSchema(
  {
    refreshToken: {
      custom: {
        options: async (value: string, { req }) => {
          if (!value)
            throw new ErrorWithStatus({
              message: USER_MESSAGES.REFRESH_TOKEN_IS_REQUIRED,
              status: HTTP_STATUS.UNAUTHORIZED
            })
          try {
            const [decodedRefreshToken, refreshToken] = await Promise.all([
              verifyToken({ token: value, secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string }),
              databaseService.refreshTokens.findOne({ token: value })
            ])
            if (!refreshToken) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.REFRESH_TOKEN_NOT_FOUND,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            ;(req as Request).decodedRefreshToken = decodedRefreshToken
          } catch (error) {
            if (error instanceof JsonWebTokenError) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.REFRESH_TOKEN_IS_INVALID,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            throw error
          }
          return true
        }
      }
    }
  },
  ['body']
)

export const verifyEmailValidator = checkSchema({
  emailVerifyToken: {
    trim: true,
    custom: {
      options: async (value, { req }) => {
        if (!value)
          throw new ErrorWithStatus({
            message: USER_MESSAGES.EMAIL_IS_REQUIRED,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        try {
          const decodedEmailVerifyToken = await verifyToken({
            token: value,
            secretOrPublicKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
          })
          ;(req as Request).decodedEmailVerifyToken = decodedEmailVerifyToken
        } catch (error) {
          if (error instanceof JsonWebTokenError) {
            throw new ErrorWithStatus({
              message: USER_MESSAGES.REFRESH_TOKEN_IS_INVALID,
              status: HTTP_STATUS.UNAUTHORIZED
            })
          }
          throw error
        }
        return true
      }
    }
  }
})

export const forgotPasswordValidator = checkSchema(
  {
    email: {
      trim: true,
      notEmpty: {
        errorMessage: USER_MESSAGES.EMAIL_IS_REQUIRED
      },
      isEmail: {
        errorMessage: USER_MESSAGES.EMAIL_IS_INVALID
      },
      custom: {
        options: async (value, { req }) => {
          const user = await databaseService.users.findOne({ email: value })
          if (!user) throw new Error(USER_MESSAGES.EMAIL_NOT_FOUND)
          req.user = user
          return true
        }
      }
    }
  },
  ['body']
)

export const verifyForgotPasswordTokenValidator = checkSchema(
  {
    forgotPasswordToken: forgotPasswordSchema
  },
  ['body']
)

export const resetPasswordValidator = checkSchema(
  {
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
    forgotPasswordToken: forgotPasswordSchema
  },
  ['body']
)

export const verifiedUserValidator = (req: Request, res: Response, next: NextFunction) => {
  const { verify } = req.decodedAuthorization as TokenPayLoad
  if (verify !== UserVerifyStatus.Verified) {
    return next(
      new ErrorWithStatus({
        message: USER_MESSAGES.EMAIL_NOT_VERIFIED,
        status: HTTP_STATUS.FORBIDDEN
      })
    )
  }
  next()
}

export const updateMyProfileValidator = checkSchema(
  {
    name: {
      ...nameSchema,
      optional: true,
      notEmpty: undefined
    },
    dateOfBirth: {
      ...dateOfBirthSchema,
      optional: true
    },
    bio: {
      optional: true,
      isString: {
        errorMessage: USER_MESSAGES.BIO_MUST_BE_A_STRING
      },
      trim: true,
      isLength: {
        options: { min: 1, max: 160 },
        errorMessage: USER_MESSAGES.BIO_LENGTH
      }
    },
    location: {
      optional: true,
      isString: {
        errorMessage: USER_MESSAGES.LOCATION_MUST_BE_A_STRING
      },
      trim: true,
      isLength: {
        options: { min: 1, max: 200 },
        errorMessage: USER_MESSAGES.LOCATION_LENGTH
      }
    },
    website: {
      optional: true,
      isString: {
        errorMessage: USER_MESSAGES.WEBSITE_MUST_BE_A_STRING
      },
      trim: true,
      isLength: {
        options: { min: 1, max: 50 },
        errorMessage: USER_MESSAGES.WEBSITE_LENGTH
      }
    },
    username: {
      optional: true,
      isString: {
        errorMessage: USER_MESSAGES.USER_NAME_MUST_BE_A_STRING
      },
      trim: true,
      custom: {
        options: async (value, { req }) => {
          if (!REGEX_USERNAME.test(value)) {
            throw new Error(USER_MESSAGES.USER_NAME_INVALID)
          }
          const user = await databaseService.users.findOne({ username: value })
          if (user) {
            throw new Error(USER_MESSAGES.USERNAME_EXIST)
          }
        }
      }
    },
    avatar: imageSchema,
    coverPhoto: imageSchema
  },
  ['body']
)
