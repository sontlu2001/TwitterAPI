import { handleUploadImage, getNameFromFullName } from '~/utils/file'
import { Request } from 'express'
import sharp from 'sharp'
import { UPLOAD_DIR } from '~/constants/dir'
import path from 'path'
import fs from 'fs'

class MediasService {
  async handleUploadSingleImage(req: Request) {
    const file = await handleUploadImage(req)
    const newName = getNameFromFullName(file.newFilename)
    const newPath = path.resolve(UPLOAD_DIR, `${newName}.jpg`)
    await sharp(file.filepath).jpeg({ quality: 50 }).toFile(newPath)
    fs.unlinkSync(file.filepath)
    return `http://localhost:3000/uploads/${newName}.jpg`
  }
}

const mediasService = new MediasService()
export default mediasService
