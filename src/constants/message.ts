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
  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required'
} as const
