import databaseService from '~/services/database.service'
import usersService from '~/services/users.services'
import { checkSchema } from 'express-validator'
import { USER_MESSAGES } from '~/constants/message'
import { hashPassword } from '~/utils/crypto'

interface UserInfo {
  email: string
  password: string
}

export const loginValidator = checkSchema({
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
})

export const registerValidator = checkSchema({
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
})
