import { body } from 'express-validator'
import { UserVerifyStatus } from './../constants/enum'
import databaseService from '~/services/database.service'
import { USER_MESSAGES } from '~/constants/message'
import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import {
  ChangePasswordReqBody,
  FollowUserReqBody,
  LoginReqBody,
  LogoutReqBody,
  RefreshTokenReqBody,
  RegisterReqBody,
  ResetPasswordReqBody,
  TokenPayLoad,
  UnFollowUserReqParams,
  UpdateMyProfileReqBody,
  VerifyEmailReqBody,
  VerifyForgotPasswordTokenReqBody
} from '~/models/request/User.request'
import User from '~/models/schemas/User.schema'
import usersService from '~/services/users.services'
import { HTTP_STATUS } from '~/constants/httpStatus'

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const user = req.user as User
  const userId = user._id as ObjectId
  const result = await usersService.login({
    userId: userId.toString(),
    verify: user.verify
  })
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
  const { _id, verify } = req.user as User
  const result = await usersService.forgotPassword({
    userId: _id.toString(),
    verify
  })

  return res.json(result)
}

export const verifyForgotPasswordTokenController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordTokenReqBody>,
  res: Response
) => {
  return res.json({
    message: USER_MESSAGES.USER_VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS
  })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response
) => {
  const { userId } = req.decodedForgotPasswordToken as TokenPayLoad
  const { password } = req.body
  const result = await usersService.resetPassword(userId, password)
  return res.json(result)
}

export const getMyProfileController = async (req: Request, res: Response) => {
  const { userId } = req.decodedAuthorization as TokenPayLoad
  console.log(userId)
  const user = await usersService.getMyProfile(userId)
  return res.json({
    message: USER_MESSAGES.GET_PROFILE_SUCCESS,
    user
  })
}

export const updateMyProfileController = async (
  req: Request<ParamsDictionary, any, UpdateMyProfileReqBody>,
  res: Response
) => {
  const { userId } = req.decodedAuthorization as TokenPayLoad
  const payload = req.body
  const user = await usersService.updateMyProfile(userId, payload)
  return res.json({
    message: USER_MESSAGES.UPDATE_MY_PROFILE_SUCCESS,
    result: user.value
  })
}

export const getProfileController = async (req: Request, res: Response) => {
  const user = await usersService.getProfile(req.params.username)
  return res.json({
    message: USER_MESSAGES.GET_PROFILE_SUCCESS,
    result: user
  })
}

export const followUserController = async (
  req: Request<ParamsDictionary, any, FollowUserReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.decodedAuthorization as TokenPayLoad
  const { followUserId } = req.body
  const result = await usersService.followUser(userId, followUserId)
  return res.json(result)
}

export const unFollowUserController = async (req: Request<ParamsDictionary>, res: Response, next: NextFunction) => {
  const { userId } = req.decodedAuthorization as TokenPayLoad
  const { userId: followedUserId } = req.params
  const result = await usersService.unFollowUser(userId, followedUserId)
  return res.json(result)
}

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.decodedAuthorization as TokenPayLoad
  const { password } = req.body
  const result = await usersService.changePassword(userId, password)
  return res.json(result)
}

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenReqBody>,
  res: Response
) => {
  const { refreshToken } = req.body
  const { userId, verify } = req.decodedRefreshToken as TokenPayLoad
  const result = await usersService.refreshToken({ userId, verify, refreshToken })
  return res.json({
    message: USER_MESSAGES.REFRESH_TOKEN_SUCCESS,
    result
  })
}
