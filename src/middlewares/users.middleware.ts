import usersService from '~/services/users.services'
import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'

interface UserInfo {
  email: string
  password: string
}
export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  const { email, password }: UserInfo = req.body
  if (!email || !password) {
    return res.status(400).json({
      error: 'Missing email or password'
    })
  }
  next()
}
export const registerValidator = checkSchema({
  name: {
    notEmpty: true,
    isLength: { options: { min: 3, max: 100 } },
    trim: true,
    errorMessage: 'Name must be between 3 and 100 characters'
  },
  email: {
    notEmpty: true,
    isEmail: true,
    trim: true,
    custom: {
      options: async (value) => {
        const isExist = await usersService.checkEmailExist(value)
        if (isExist) throw new Error('Email already exists')
        return true
      }
    }
  },
  password: {
    notEmpty: true,
    isString: true,
    isStrongPassword: {
      options: { minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 },
      errorMessage:
        'Password must be at least 6 characters long and contain at least 1 lowercase, 1 uppercase, 1 number and 1 symbol'
    }
  },
  confirm_password: {
    notEmpty: true,
    custom: {
      options: (value, { req }) => {
        if (req.body.password !== value) throw new Error('Password confirmation does not match password')
        return true
      }
    }
  },
  dateOfBirth: {
    isISO8601: { options: { strict: true, strictSeparator: true } },
    errorMessage: 'Invalid date of birth'
  }
})
