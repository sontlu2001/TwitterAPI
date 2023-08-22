import { Request } from 'express'
import { TokenType } from './constants/enum'

declare module 'express' {
  interface Request {
    user?: User
    decodedAuthorization?: TokenPayLoad
    decodedRefreshToken?: TokenPayLoad
  }
}
