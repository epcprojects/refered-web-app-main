import type { RecaptchaVerifier } from 'firebase/auth';

export type ArrayType<T> = T extends (infer U)[] ? U : never;
export type ObjectType<T> = T extends (infer U)[] ? U : never;

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}
