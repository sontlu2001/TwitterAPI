import { JwtPayload } from 'jsonwebtoken'
import { ParamsDictionary } from 'express-serve-static-core'

export interface RegisterReqBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: string
}

export interface LoginReqBody {
  email: string
  password: string
}

export interface LogoutReqBody {
  refreshToken: string
}

export interface TokenPayLoad extends JwtPayload {
  userId: string
  token_type: string
}

export interface VerifyEmailReqBody {
  emailVerifyToken: string
}

export interface ForgotPasswordReqBody {
  email: string
}

export interface VerifyForgotPasswordTokenReqBody {
  forgotPasswordToken: string
}

export interface ResetPasswordReqBody {
  password: string
  confirmPassword: string
  verifyForgotPasswordToken: string
}

export interface UpdateMyProfileReqBody {
  name?: string
  username?: string
  date_of_birth?: string
  bio?: string
  location?: string
  website?: string
  avatar?: string
  cover_photo?: string
}

export interface FollowUserReqBody {
  followUserId: string
}

export interface UnFollowUserReqParams extends ParamsDictionary {
  userId: string
}