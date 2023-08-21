import jwt, { SignOptions } from 'jsonwebtoken'
import { config } from 'dotenv'
config()

export const signToken = ({
  payload,
  privateKey = process.env.JWT_SECRET as string,
  option = {
    algorithm: 'HS256'
  }
}: {
  payload: string | object | Buffer
  privateKey?: string
  option?: SignOptions
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, option, (err, token) => {
      if (err) reject(err)
      resolve(token as string)
    })
  })
}
