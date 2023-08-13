import { NextFunction, Request, Response } from 'express'

interface UserInfo {
  email: string
  password: string
}
export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  const { email, password }: UserInfo = req.body
  if (!email || !password) {
    return res.status(400).json({
      error: 'Missing email or password'
    })
  }
  next()
}
