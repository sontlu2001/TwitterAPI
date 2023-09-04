import { handleUploadImage, getNameFromFullName } from '~/utils/file'
import { Request } from 'express'
import sharp from 'sharp'
import { UPLOAD_DIR } from '~/constants/dir'
import path from 'path'
import fs from 'fs'
import { isProduction } from '~/constants/config'
import { config } from 'dotenv'
config()

class MediasService {
  async handleUploadSingleImage(req: Request) {
    const file = await handleUploadImage(req)
    const newName = getNameFromFullName(file.newFilename)
    const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpg`)
    await sharp(file.filepath).jpeg({ quality: 50 }).toFile(newPath)
    fs.unlinkSync(file.filepath)
    return isProduction
      ? `${process.env.HOST}/static/${newName}.jpg`
      : `http://localhost:${process.env.PORT}/static/${newName}.jpg`
  }
}

const mediasService = new MediasService()
export default mediasService
