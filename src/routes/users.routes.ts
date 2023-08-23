import { NextFunction, Request, Response, Router } from 'express'
import {
  forgotPasswordController,
  loginController,
  logoutController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  verifyEmailController,
  verifyForgotPasswordTokenController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  verifyEmailValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handles'
import { validate } from '~/utils/validation'
const usersRouter = Router()

usersRouter.post('/login', validate(loginValidator), wrapRequestHandler(loginController))
/**
 * Description. Register a new user
 * Path: /users/register
 * Method: POST
 * Body: {name: string, email: string, password: string, confirm_password:string,dateOfBirth:string}
 */
usersRouter.post('/register', validate(registerValidator), wrapRequestHandler(registerController))
usersRouter.post(
  '/logout',
  validate(accessTokenValidator),
  validate(refreshTokenValidator),
  wrapRequestHandler(logoutController)
)
usersRouter.post('/verify-email', validate(verifyEmailValidator), wrapRequestHandler(verifyEmailController))
usersRouter.post(
  '/resend-verify-email',
  validate(accessTokenValidator),
  wrapRequestHandler(resendVerifyEmailController)
)
usersRouter.post('/forgot-password', validate(forgotPasswordValidator), wrapRequestHandler(forgotPasswordController))
usersRouter.post(
  '/verify-forgot-password',
  validate(verifyForgotPasswordTokenValidator),
  wrapRequestHandler(verifyForgotPasswordTokenController)
)
usersRouter.post(
  '/reset-password',
  validate(resetPasswordValidator),
  wrapRequestHandler(resetPasswordController)
)

export default usersRouter
