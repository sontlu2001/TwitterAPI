import { USER_MESSAGES } from '~/constants/message'
import { NextFunction, Request, Response } from 'express'
import mediasService from '~/services/medias.services'
import { handleUploadImage } from '~/utils/file'
import path from 'path'
import { UPLOAD_DIR } from '~/constants/dir'

export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  const url = await mediasService.handleUploadSingleImage(req)
  if (url) {
    return res.json({
      message: USER_MESSAGES.UPLOAD_SUCCESS,
      result: url
    })
  }
}

export const serveImageController = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.params
  return res.sendFile(path.resolve(UPLOAD_DIR, name + '.jpg'), (err) => {
    if (err) {
      res.status((err as any).status).send('Not found')
    }
  })
}
