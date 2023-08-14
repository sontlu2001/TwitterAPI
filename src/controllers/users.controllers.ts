import { Request, Response } from 'express'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.service'
import usersService from '~/services/users.services'

interface UserInfo {
  email: string
  password: string
}

export const loginController = (req: Request, res: Response) => {
  const { email, password }: UserInfo = req.body
  if (email === 'test' && password === 'test123') {
    return res.json({
      message: 'Login success'
    })
  }
  return res.status(400).json({
    error: 'Login failed!'
  })
}

export const registerController = async (req: Request, res: Response) => {
  const { email, password }: UserInfo = req.body
  try {
    const result = await usersService.register({ email, password })
    return res.json({
      message: "Register success",
      userId: result.insertedId
    })
  } catch (error) {
    return res.status(400).json({
      message: "Register failed"
    })
  }
}
