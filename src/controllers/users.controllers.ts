import { USER_MESSAGES } from '~/constants/message'
import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { RegisterReqBody } from '~/models/request/User.request'
import User from '~/models/schemas/User.schema'
import usersService from '~/services/users.services'

interface UserInfo {
  email: string
  password: string
}

export const loginController = async (req: Request, res: Response) => {
  const user = req.user as User
  const userId = user._id as ObjectId
  const result = await usersService.login(userId.toString())
  return res.json({
    message: USER_MESSAGES.LOGIN_SUCCESS,
    result
  })
}

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await usersService.register(req.body)
    return res.json({
      message: USER_MESSAGES.REGISTER_SUCCESS,
      result
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}
