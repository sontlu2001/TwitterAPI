import express from 'express'
import { defaultErrorHandler } from './middlewares/error.middleware'
import mediasRouter from './routes/media.routes'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.service'
import { initFolder } from './utils/file'

const app = express()
const port = 3000

initFolder()

app.use(express.json())
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
// default error handler
app.use(defaultErrorHandler)
//connect mongo Atlat
databaseService.connect()

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
