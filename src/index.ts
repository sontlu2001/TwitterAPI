import express, { NextFunction, Request, Response } from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.service'

const app = express()
const port = 3000

app.use(express.json())
app.use('/users', usersRouter)
// default error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.message)
  res.status(405).json({ error: err.message })
})
//connect mongo Atlat
databaseService.connect()

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
