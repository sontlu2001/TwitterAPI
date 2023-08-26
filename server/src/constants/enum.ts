export enum UserVerifyStatus {
  Unverified, //default 0
  Verified,
  Banned
}

export enum TokenType {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerifyToken
}
