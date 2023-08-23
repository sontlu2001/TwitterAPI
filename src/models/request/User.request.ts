import { JwtPayload } from 'jsonwebtoken'

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
  password: string,
  confirmPassword: string,
  verifyForgotPasswordToken: string
}