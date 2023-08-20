import express from 'express'
import { defaultErrorHandler } from './middlewares/error.middleware'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.service'

const app = express()
const port = 3000

app.use(express.json())
app.use('/users', usersRouter)
// default error handler
app.use(defaultErrorHandler)
//connect mongo Atlat
databaseService.connect()

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
