import { NextFunction, Request, Response, Router } from 'express'
import { loginController, registerController } from '~/controllers/users.controllers'
import { accessTokenValidator, loginValidator, registerValidator } from '~/middlewares/users.middleware'
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
usersRouter.post('/logout', validate(accessTokenValidator), (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: 'Logout success' })
})

export default usersRouter
