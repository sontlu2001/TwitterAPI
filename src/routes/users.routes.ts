import { NextFunction, Request, Response, Router } from 'express'
import { get } from 'lodash'
import {
  forgotPasswordController,
  getMyProfileController,
  getProfileController,
  loginController,
  logoutController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  updateMyProfileController,
  verifyEmailController,
  verifyForgotPasswordTokenController
} from '~/controllers/users.controllers'
import { filterMiddleware } from '~/middlewares/common.middleware'
import {
  accessTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  updateMyProfileValidator,
  verifiedUserValidator,
  verifyEmailValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/users.middleware'
import { UpdateMyProfileReqBody } from '~/models/request/User.request'
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
usersRouter.post('/reset-password', validate(resetPasswordValidator), wrapRequestHandler(resetPasswordController))

usersRouter.get('/my-profile', validate(accessTokenValidator), wrapRequestHandler(getMyProfileController))
usersRouter.patch(
  '/my-profile',
  validate(accessTokenValidator),
  verifiedUserValidator,
  validate(updateMyProfileValidator),
  filterMiddleware<UpdateMyProfileReqBody>([
    'name',
    'username',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'username'
  ]),
  wrapRequestHandler(updateMyProfileController)
)
usersRouter.get('/:username', wrapRequestHandler(getProfileController))
export default usersRouter
