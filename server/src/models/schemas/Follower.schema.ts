import { ObjectId } from 'mongodb'

export interface FollowerType {
  _id?: ObjectId
  user_id: ObjectId
  follower_user_id: ObjectId
  created_at?: Date
}

export default class Follower {
  _id?: ObjectId
  user_id: ObjectId
  follower_user_id: ObjectId
  created_at: Date

  constructor({ _id, user_id, follower_user_id, created_at }: FollowerType) {
    this._id = _id
    this.user_id = user_id
    this.follower_user_id = follower_user_id
    this.created_at = created_at || new Date()
  }
}
