const ERROR = {
  REQUIRED: (name?: string) => `${name || 'Field'} is required`,
  EMAIL: () => 'Invalid email address',
  OTP: () => 'Invalid OTP code',
  ALPHANUMERIC: () => 'Only letters and numbers are allowed',
  NUMERIC: () => 'Please enter valid numeric value',
  MIN_LENGTH: (minLength: number) => `Must be atleast ${minLength} characters long`,
  MAX_LENGTH: (minLength: number) => `Maximum ${minLength} characters are allowed`,
  MIN_LENGTH_NUMBER: (minLength: number) => `Must be atleast ${minLength} digits long`,
  MAX_LENGTH_NUMBER: (minLength: number) => `Maximum ${minLength} digits are allowed`,
  ATLEAST_ONE_LOWERCASE_LETTER: () => 'Must contain at least one lowercase letter',
  ATLEAST_ONE_UPPERCASE_LETTER: () => 'Must contain at least one uppercase letter',
  ATLEAST_ONE_SPECIAL_CHARACTER: () => 'Must contain at least one special character',
  NO_CODE_ALLOWED: () => 'Cannot contain HTML, CSS or JavaScript code',
};

const ERROR_CODE = {
  TOO_SMALL: 'too_small',
  TOO_BIG: 'too_big',
};

export const ZOD = {
  ERROR,
  ERROR_CODE,
};
