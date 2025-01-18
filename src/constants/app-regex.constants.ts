export const AppRegex = {
  IS_NUMBER: new RegExp(/^\d+$/),
  ALPHANUMERIC: new RegExp(/^[a-zA-Z0-9]+$/),
  ATLEAST_ONE_LOWERCASE_LETTER: new RegExp(/(?=.*[a-z])/),
  ATLEAST_ONE_UPPERCASE_LETTER: new RegExp(/(?=.*[A-Z])/),
  ATLEAST_ONE_SPECIAL_CHARACTER: new RegExp(/(?=.*[!@#$%^&*(),.?":{}|<>])/),
  NO_CODE_ALLOWED: new RegExp(/<[^>]*>|<\/[^>]*>|<script.*?>.*?<\/script>|style=["'][^"']*["']/i),
};
