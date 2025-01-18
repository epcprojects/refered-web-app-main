const ERROR_CODE = [
  // Authentication Errors
  'auth/invalid-email',
  'auth/invalid-phone-number',
  'auth/user-disabled',
  'auth/user-not-found',
  'auth/wrong-password',
  'auth/email-already-in-use',
  'auth/weak-password',
  'auth/missing-email',
  'auth/operation-not-allowed',
  // Token Errors
  'auth/id-token-expired',
  'auth/id-token-revoked',
  'auth/invalid-id-token',
  // Network Errors
  'auth/network-request-failed',
  // OTP (Phone Authentication) Errors
  'auth/invalid-verification-code',
  'auth/missing-verification-code',
  'auth/quota-exceeded',
  // Custom Token Errors
  'auth/custom-token-mismatch',
  'auth/invalid-custom-token',
  // General Errors
  'auth/too-many-requests',
  'auth/unauthorized-domain',
  'auth/unknown',
  'auth/error-code:-39',
] as const;

const ERROR_MESSAGE: Record<(typeof ERROR_CODE)[number], string> = {
  // Authentication Errors
  'auth/invalid-email': 'The phone number is not valid. Please enter a valid phone number.', // 'The email address is not valid. Please enter a valid email address.',
  'auth/user-disabled': 'Invalid credentials entered!', //'This user account has been disabled. Please contact support for more information.',
  'auth/user-not-found': 'Invalid credentials entered!', //'No user found with this email. Please sign up or try again.',
  'auth/wrong-password': 'Invalid credentials entered!', //'The password is incorrect. Please try again.',
  'auth/email-already-in-use': 'This phone number is already in use. Please use a different phone number or log in.', // 'This email address is already in use. Please use a different email or log in.',
  'auth/weak-password': 'The password is too weak. Please choose a stronger password.',
  'auth/missing-email': 'Please enter an email address.',
  'auth/operation-not-allowed': 'This operation is not allowed. Please contact support.',
  'auth/invalid-phone-number': 'The phone number is not valid. Please enter a valid phone number.',
  // Token Errors
  'auth/id-token-expired': 'Your session has expired. Please log in again.',
  'auth/id-token-revoked': 'Your session token has been revoked. Please log in again.',
  'auth/invalid-id-token': 'The provided token is invalid. Please log in again.',
  // Network Errors
  'auth/network-request-failed': 'A network error occurred. Please check your connection and try again.',
  // OTP (Phone Authentication) Errors
  'auth/invalid-verification-code': 'The verification code is invalid. Please check and try again.',
  'auth/missing-verification-code': 'Please enter the verification code sent to your phone.',
  'auth/quota-exceeded': 'SMS quota exceeded. Please try again later.',
  // Custom Token Errors
  'auth/custom-token-mismatch': 'The custom token does not match the expected audience.',
  'auth/invalid-custom-token': 'The custom token provided is invalid. Please try again.',
  // General Errors
  'auth/too-many-requests': 'We have detected unusual activity. Please try again later.',
  'auth/unauthorized-domain': 'This domain is not authorized to perform this operation.',
  'auth/unknown': 'An unknown error occurred. Please try again later.',
  'auth/error-code:-39': 'OTP cannot be sent on this phone number',
};

export type FIREBASE_ERROR_CODES_TYPE = (typeof ERROR_CODE)[number];
export const FIREBASE = {
  ERROR_MESSAGE,
  ERROR_CODE,
};
