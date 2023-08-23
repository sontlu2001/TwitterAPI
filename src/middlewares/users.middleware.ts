import databaseService from '~/services/database.service'
import usersService from '~/services/users.services'
import { checkSchema } from 'express-validator'
import { USER_MESSAGES } from '~/constants/message'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { ErrorWithStatus } from '~/models/Errors'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize, concat } from 'lodash'
import { Request } from 'express'

interface UserInfo {
  email: string
  password: string
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
    name: {
      notEmpty: {
        errorMessage: USER_MESSAGES.NAME_IS_REQUIRED
      },
      isString: {
        errorMessage: USER_MESSAGES.NAME_MUST_BE_A_STRING
      },
      isLength: { options: { min: 3, max: 100 } },
      trim: true,
      errorMessage: USER_MESSAGES.NAME_MUST_BE_FROM_3_TO_100_CHARACTERS
    },
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
    password: {
      notEmpty: {
        errorMessage: USER_MESSAGES.PASSWORD_IS_REQUIRED
      },
      isString: {
        errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_A_STRING
      },
      isStrongPassword: {
        options: { minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 },
        errorMessage: USER_MESSAGES.PASSWORD_MUST_BE_STRONG
      }
    },
    confirm_password: {
      notEmpty: {
        errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
      },
      custom: {
        options: (value, { req }) => {
          if (req.body.password !== value) throw new Error(USER_MESSAGES.PASSWORD_CONFIRMATION_DOES_NOT_MATCH_PASSWORD)
          return true
        }
      }
    },
    dateOfBirth: {
      isISO8601: {
        options: {
          strict: true,
          strictSeparator: true
        }
      },
      errorMessage: USER_MESSAGES.DATE_OF_BIRTH_MUST_BE_ISO8601
    }
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
