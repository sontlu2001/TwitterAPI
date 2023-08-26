import { HTTP_STATUS } from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'
import Follower from '~/models/schemas/Follower.schema'
import { USER_MESSAGES } from '~/constants/message'
import { TokenType, UserVerifyStatus } from './../constants/enum'
import { RegisterReqBody, UpdateMyProfileReqBody } from '~/models/request/User.request'
import User from '~/models/schemas/User.schema'
import databaseService from './database.service'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import RefreshToken from '~/models/schemas/RefreshToken'
import { ObjectId } from 'mongodb'
import { config } from 'dotenv'
import axios from 'axios'
config()

class UsersService {
  private signAccessToken({ userId, verify }: { userId: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        userId,
        token_type: TokenType.AccessToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      option: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
      }
    })
  }

  private signRefreshToken({ userId, verify }: { userId: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        userId,
        token_type: TokenType.RefreshToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      option: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      }
    })
  }

  private async signAccessTokenAndRefreshToken({ userId, verify }: { userId: string; verify: UserVerifyStatus }) {
    return await Promise.all([this.signAccessToken({ userId, verify }), this.signRefreshToken({ userId, verify })])
  }

  private async signEmailVerifyToken({ userId, verify }: { userId: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        userId,
        token_type: TokenType.EmailVerifyToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      option: {
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN
      }
    })
  }

  private async signForgotPasswordToken({ userId, verify }: { userId: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        userId,
        token_type: TokenType.ForgotPasswordToken,
        verify
      },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      option: {
        expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN
      }
    })
  }

  private async getOauthGoogleToken(code: string) {
    const body = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    }
    const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    return data as {
      access_token: string
      id_token: string
    }
  }

  private async getGoogleUserInfo(access_token: string, id_token: string) {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      params: {
        access_token,
        alt: 'json'
      },
      headers: {
        Authorization: `Bearer ${id_token}`
      }
    })
    return data as {
      id: string
      email: string
      verified_email: boolean
      given_name: string
      family_name: string
      picture: string
      locale: string
    }
  }

  async register(payload: RegisterReqBody) {
    const userId = new ObjectId()
    const emailVerifyToken = await this.signEmailVerifyToken({
      userId: userId.toString(),
      verify: UserVerifyStatus.Unverified
    })
    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: userId,
        email_verify_token: emailVerifyToken,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )
    const [accessToken, refreshToken] = await this.signAccessTokenAndRefreshToken({
      userId: userId.toString(),
      verify: UserVerifyStatus.Unverified
    })
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(userId), token: refreshToken })
    )
    return {
      accessToken,
      refreshToken
    }
  }

  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email })
    return Boolean(user)
  }

  async login({ userId, verify }: { userId: string; verify: UserVerifyStatus }) {
    const [accessToken, refreshToken] = await this.signAccessTokenAndRefreshToken({ userId, verify })
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(userId), token: refreshToken })
    )
    return {
      accessToken,
      refreshToken
    }
  }

  async oauth(code: string) {
    const { id_token, access_token } = await this.getOauthGoogleToken(code)
    const userInfo = await this.getGoogleUserInfo(access_token, id_token)

    if (!userInfo.verified_email) {
      throw new ErrorWithStatus({
        message: USER_MESSAGES.GMAIL_NOT_VERIFIED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    // check email exist
    const user = await databaseService.users.findOne({ email: userInfo.email })
    if (user) {
      // login
      const data = await this.login({ userId: user._id.toString(), verify: user.verify })
      return {
        ...data,
        newUser: 0,
        verify: user.verify
      }
    } else {
      // random string password
      const password = Math.random().toString(36).substring(2, 15)
      // register
      const data = await this.register({
        email: userInfo.email,
        name: userInfo.given_name + ' ' + userInfo.family_name,
        date_of_birth: new Date().toISOString(),
        password: password,
        confirm_password: password
      })
      return {
        ...data,
        newUser: 1,
        verify: UserVerifyStatus.Unverified
      }
    }
  }

  async logout(refreshToken: string) {
    await databaseService.refreshTokens.deleteOne({ token: refreshToken })
    return {
      message: USER_MESSAGES.LOGOUT_SUCCESS
    }
  }

  async verifyEmail(userId: string) {
    const [token] = await Promise.all([
      this.signAccessTokenAndRefreshToken({ userId, verify: UserVerifyStatus.Verified }),
      await databaseService.users.updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            email_verify_token: '',
            verify: UserVerifyStatus.Verified
          },
          $currentDate: {
            updated_at: true
          }
        }
      )
    ])
    const [accessToken, refreshToken] = token
    return {
      accessToken,
      refreshToken
    }
  }

  async resendVerifyEmail(userId: string) {
    const emailVerifyToken = await this.signEmailVerifyToken({
      userId,
      verify: UserVerifyStatus.Unverified
    })
    // send mail

    await databaseService.users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          email_verify_token: emailVerifyToken
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      message: USER_MESSAGES.EMAIL_RESEND_VERIFY_SUCCESS
    }
  }

  async forgotPassword({ userId, verify }: { userId: string; verify: UserVerifyStatus }) {
    const forgotPasswordToken = await this.signForgotPasswordToken({ userId, verify })
    await databaseService.users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          forgot_password_token: forgotPasswordToken
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    // send mail: http://localhost:3000/users/forgot-password?forgotPasswordToken=xxxx
    return {
      message: USER_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD
    }
  }

  async resetPassword(userId: string, newPassword: string) {
    console.log(userId, newPassword)
    await databaseService.users.updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          forgot_password_token: '',
          password: hashPassword(newPassword)
        },
        $currentDate: {
          updated_at: true
        }
      }
    )
    return {
      message: USER_MESSAGES.RESET_PASSWORD_SUCCESS
    }
  }

  async getMyProfile(userId: string) {
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(userId) },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return user
  }

  async updateMyProfile(userId: string, payload: UpdateMyProfileReqBody) {
    const _payload = payload.date_of_birth
      ? { ...payload, date_of_birth: new Date(payload.date_of_birth) }
      : { ...payload }
    const user = await databaseService.users.findOneAndUpdate(
      {
        _id: new ObjectId(userId)
      },
      {
        $set: { ...(_payload as UpdateMyProfileReqBody & { date_of_birth?: Date }) },
        $currentDate: { updated_at: true }
      },
      {
        returnDocument: 'after',
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return user
  }

  async getProfile(username: string) {
    const user = await databaseService.users.findOne(
      { username },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return user
  }

  async followUser(userId: string, followUserId: string) {
    const isFollower = await databaseService.followers.findOne({
      user_id: new ObjectId(userId),
      follower_user_id: new ObjectId(followUserId)
    })
    if (isFollower === null) {
      await databaseService.followers.insertOne(
        new Follower({
          user_id: new ObjectId(userId),
          follower_user_id: new ObjectId(followUserId)
        })
      )
      return {
        message: USER_MESSAGES.FOLLOW_USER_SUCCESS
      }
    }
    return { message: USER_MESSAGES.FOLLOWED }
  }

  async unFollowUser(userId: string, followUserId: string) {
    const isFollower = await databaseService.followers.findOne({
      user_id: new ObjectId(userId),
      follower_user_id: new ObjectId(followUserId)
    })
    if (isFollower === null) {
      return { message: USER_MESSAGES.ALREADY_UNFOLLOWED }
    }
    await databaseService.followers.deleteOne({
      user_id: new ObjectId(userId),
      follower_user_id: new ObjectId(followUserId)
    })
    return {
      message: USER_MESSAGES.UNFOLLOW_USER_SUCCESS
    }
  }
}

const usersService = new UsersService()
export default usersService
