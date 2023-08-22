import { NextFunction, Request, Response, Router } from 'express'
import {
  loginController,
  logoutController,
  registerController,
  resendVerifyEmailController,
  verifyEmailController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  verifyEmailValidator
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

export default usersRouter
