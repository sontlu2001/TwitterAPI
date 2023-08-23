import { UserVerifyStatus } from './../constants/enum'
import databaseService from '~/services/database.service'
import { USER_MESSAGES } from '~/constants/message'
import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import {
  LoginReqBody,
  LogoutReqBody,
  RegisterReqBody,
  TokenPayLoad,
  VerifyEmailReqBody
} from '~/models/request/User.request'
import User from '~/models/schemas/User.schema'
import usersService from '~/services/users.services'
import { HTTP_STATUS } from '~/constants/httpStatus'

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
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
  const result = await usersService.register(req.body)
  return res.json({
    message: USER_MESSAGES.REGISTER_SUCCESS,
    result
  })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refreshToken } = req.body
  const result = await usersService.logout(refreshToken)
  return res.json(result)
}

export const verifyEmailController = async (
  req: Request<ParamsDictionary, any, VerifyEmailReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.decodedEmailVerifyToken as TokenPayLoad
  const user = await databaseService.users.findOne({ _id: new ObjectId(userId) })
  if (!user) {
    return res.status(HTTP_STATUS.NOTFOUND).json({
      message: USER_MESSAGES.USER_NOT_FOUND
    })
  }
  // Đã verify email sẽ trả về status OK với message là user đã verify email
  if (user.email_verify_token === '') {
    return res.status(HTTP_STATUS.OK).json({
      message: USER_MESSAGES.EMAIL_AlREADY_VERIFIED
    })
  }
  // Nếu chưa verify email
  const result = await usersService.verifyEmail(userId)
  return res.json({
    message: USER_MESSAGES.EMAIL_VERIFY_SUCCESS,
    result
  })
}

export const resendVerifyEmailController = async (req: Request, res: Response) => {
  const { userId } = req.decodedAuthorization as TokenPayLoad
  const user = await databaseService.users.findOne({ _id: new ObjectId(userId) })
  if (!user) {
    return res.status(HTTP_STATUS.NOTFOUND).json({
      message: USER_MESSAGES.USER_NOT_FOUND
    })
  }
  if (user.verify === UserVerifyStatus.Verified) {
    return res.status(HTTP_STATUS.OK).json({
      message: USER_MESSAGES.EMAIL_AlREADY_VERIFIED
    })
  }
  const result = await usersService.resendVerifyEmail(userId)
  return res.json(result)
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, VerifyEmailReqBody>,
  res: Response
) => {
  const { _id } = req.user as User
  const result = await usersService.forgotPassword(_id.toString())
  return res.json(result)
}
