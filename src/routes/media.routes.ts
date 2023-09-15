import { validate } from './../utils/validation'
import { Router } from 'express'
import { uploadImageController } from '~/controllers/media.controllers'
import { accessTokenValidator, refreshTokenValidator, verifiedUserValidator } from '~/middlewares/users.middleware'
import { wrapRequestHandler } from '~/utils/handles'
const mediasRouter = Router()

mediasRouter.post(
  '/upload-image',
  validate(accessTokenValidator),
  verifiedUserValidator,
  wrapRequestHandler(uploadImageController)
)

export default mediasRouter
