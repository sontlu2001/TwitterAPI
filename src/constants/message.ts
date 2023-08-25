export const USER_MESSAGES = {
  MISSING_EMAIL_OR_PASSWORD: 'Missing email or password',
  VALIDATION_ERROR: 'Validation error',
  NAME_IS_REQUIRED: 'Name is required',
  NAME_MUST_BE_A_STRING: 'Name must be a string',
  NAME_MUST_BE_FROM_3_TO_100_CHARACTERS: 'Name must be from 3 to 100 characters',
  EMAIL_IS_REQUIRED: 'Email is required',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  EMAIL_IS_INVALID: 'Email is invalid',
  EMAIL_OR_PASSWORD_IS_INCORRECT: 'Email or password is incorrect',
  EMAIL_AlREADY_VERIFIED: 'Email already verified',
  EMAIL_VERIFY_SUCCESS: 'Email verify success',
  EMAIL_RESEND_VERIFY_SUCCESS: 'Email resend verify success',
  EMAIL_NOT_FOUND: 'Email not found',
  PASSWORD_IS_REQUIRED: 'Password is required',
  PASSWORD_MUST_BE_A_STRING: 'Password must be a string',
  PASSWORD_MUST_BE_FROM_6_TO_30_CHARACTERS: 'Password must be from 6 to 30 characters',
  PASSWORD_MUST_BE_STRONG:
    'Password must be 6-50 characters long and contain at least 1 lowercase, 1 uppercase, 1 number and 1 symbol',
  CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required',
  PASSWORD_CONFIRMATION_DOES_NOT_MATCH_PASSWORD: 'Password confirmation does not match password',
  DATE_OF_BIRTH_MUST_BE_ISO8601: 'Date of birth must be ISO8601 format',
  USER_NOT_FOUND: 'User not found',
  REGISTER_SUCCESS: 'Register success',
  LOGIN_SUCCESS: 'Login success',
  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token is required',
  REFRESH_TOKEN_IS_INVALID: 'Refresh token is invalid',
  LOGOUT_SUCCESS: 'Logout success',
  REFRESH_TOKEN_NOT_FOUND: 'Refresh token not found',
  CHECK_EMAIL_TO_RESET_PASSWORD: 'Check email to reset password',
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Forgot password token is required',
  FORGOT_PASSWORD_TOKEN_INVALID: 'Forgot password token invalid',
  USER_VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS: 'User verify forgot password token success',
  RESET_PASSWORD_SUCCESS: 'Reset password success',
  GET_PROFILE_SUCCESS: 'Get profile success',
  EMAIL_NOT_VERIFIED: 'Email not verified',
  BIO_MUST_BE_A_STRING: 'Bio must be a string',
  BIO_LENGTH: 'Bio must be from 1 to 160 characters',
  LOCATION_MUST_BE_A_STRING: 'Location must be a string',
  LOCATION_LENGTH: 'Location must be from 1 to 200 characters',
  WEBSITE_MUST_BE_A_STRING: 'Website must be a string',
  WEBSITE_LENGTH: 'Website must be from 1 to 50 characters',
  USER_NAME_MUST_BE_A_STRING: 'User name must be a string',
  USER_NAME_INVALID: 'User name must be from 4 to 15 characters long and contain only letters, numbers and underscores',
  USERNAME_EXIST: 'Username exist',
  IMAGE_URL_MUST_BE_A_STRING: 'Image url must be a string',
  IMAGE_URL_LENGTH: 'Image url must be from 1 to 400 characters',
  UPDATE_MY_PROFILE_SUCCESS: 'Update my profile success',
  FOLLOW_USER_SUCCESS: 'Follow user success',
  INVALID_USER_ID: 'Invalid user id',
  FOLLOWED: 'User followed',
  ALREADY_UNFOLLOWED: 'User already unfollowed',
  UNFOLLOW_USER_SUCCESS: 'Unfollow user success',
  OLD_PASSWORD_INCORRECT: 'Old password incorrect',
  CHANGE_PASSWORD_SUCCESS: 'Change password success'
} as const
