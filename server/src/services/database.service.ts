import { Collection, Db, MongoClient, ServerApiVersion } from 'mongodb'
import { config } from 'dotenv'
import User from '~/models/schemas/User.schema'
import { get } from 'lodash'
import RefreshToken from '~/models/schemas/RefreshToken'
import Follower from '~/models/schemas/Follower.schema'

config()
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.4pi3zzt.mongodb.net/?retryWrites=true&w=majority`

class DataBaseService {
  private client: MongoClient
  private db: Db

  constructor() {
    // Create a MongoClient with a MongoClientOptions object to set the Stable API version
    this.client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      }
    })
    this.db = this.client.db(process.env.DB_NAME)
  }

  async connect() {
    try {
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log(error)
    }
  }

  get users(): Collection<User> {
    return this.db.collection('users')
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection('refresh_tokens')
  }

  get followers(): Collection<Follower> {
    return this.db.collection('followers')
  }
}

const databaseService = new DataBaseService()
export default databaseService
