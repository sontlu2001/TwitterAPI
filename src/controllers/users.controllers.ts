import { Request, Response } from 'express'

interface UserInfo {
  email: string
  password: string
}

export const loginController = (req: Request, res: Response) => {
  const { email, password }: UserInfo = req.body
  if (email === 'test' && password === 'test123') {
    return res.json({
      message: 'Login success'
    })
  }
  return res.status(400).json({
    error: 'Login failed!'
  })
}
