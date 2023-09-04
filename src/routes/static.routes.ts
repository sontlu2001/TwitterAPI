import { serveImageController } from './../controllers/media.controllers'
import { Router } from 'express'

const staticRouter = Router()

staticRouter.get('/image/:name', serveImageController)

export default staticRouter
