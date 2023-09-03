import { NextFunction, Request, Response } from 'express'
import { handleUploadImage } from '~/utils/file'

export const uploadSingleImageController = async (req: Request, res: Response, next: NextFunction) => {
  const data = await handleUploadImage(req)
  if (data) {
    return res.json({
      message: 'Upload image successfully'
    })
  }
}
