import { ObjectId } from 'mongodb'

type RefreshTokenType = {
  _id?: ObjectId
  user_id: ObjectId
  token: string
  created_at?: Date
}

export default class RefreshToken {
  _id?: ObjectId
  user_id: ObjectId
  token: string
  created_at: Date

  constructor({ _id, token, user_id, created_at }: RefreshTokenType) {
    this._id = _id
    this.token = token
    this.user_id = user_id
    this.created_at = created_at || new Date()
  }
}
