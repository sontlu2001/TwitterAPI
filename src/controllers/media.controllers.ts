import { NextFunction, Request, Response } from 'express'
import mediasService from '~/services/medias.services'
import { handleUploadImage } from '~/utils/file'

export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await mediasService.handleUploadSingleImage(req)
  if (result) {
    return res.json({
      result: result
    })
  }
}
