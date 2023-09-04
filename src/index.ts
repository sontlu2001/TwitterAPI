import { UPLOAD_DIR } from './constants/dir'
import { config } from 'dotenv'
import express from 'express'
import { defaultErrorHandler } from './middlewares/error.middleware'
import mediasRouter from './routes/media.routes'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.service'
import { initFolder } from './utils/file'
import staticRouter from './routes/static.routes'
config()

const app = express()
const port = process.env.PORT || 3000

initFolder()

app.use(express.json())
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
// app.use('/static', express.static(UPLOAD_DIR)) =>C1
app.use('/static', staticRouter)

// default error handler
app.use(defaultErrorHandler)
//connect mongo Atlat
databaseService.connect()

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
