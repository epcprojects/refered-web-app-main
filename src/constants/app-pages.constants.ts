import { startsWith } from '@/utils/lodash.utils';

const AppPublicPages = {
  SIGNIN: '/signin',
  SIGNUP: '/signup',
  VERIFICATION: '/verification',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: `/reset-password`,
  TERMS: `/terms`,
  DATA_POLICY: `/data-policy`,
  COOKIE_POLICY: `/cookie-policy`,
};

const AppProtectedPages = {
  HOME_DEFAULT: '/',
  HOME: '/home',
  SEARCH: '/search',
  PROFILE: `/profile`,
  EDIT_PROFILE: `/profile/edit`,
  CHATS: '/chats',
  CHAT_MESSAGES: '/chats',
  NOTIFICATIONS: `/notifications`,
  FAQS: `/faqs`,
  CONTACT: `/contact`,
  VERIFICATION_SUCCESS: '/verification-success',
  REFERRAL: '/referral',
};

const ExternalPublicPages = {
  IOS_APP: 'https://apps.apple.com/us/app/referd/id1561455605',
  INSTAGRAM: 'https://www.instagram.com/referdco',
  FACEBOOK: 'https://wwww.facebook.com/GetReferdCo',
  LINKEDIN: '#',
  TWITTER: '#',
};

export const PublicPagePathnames: string[] = Object.values(AppPublicPages);
export const ProtectedPagePathnames: string[] = Object.values(AppProtectedPages);
export const ProtectedPagePathnamesWithoutHomeDefault: string[] = Object.values(AppProtectedPages).slice(1);

export const AppPages = Object.freeze({ ...AppPublicPages, ...AppProtectedPages });
export type AppPagesType = keyof typeof AppPages;

export const ExternalPages = Object.freeze({ ...ExternalPublicPages });
export type ExternalPagesType = keyof typeof ExternalPages;

export const isProtectedPath = (pathname: string) => !!ProtectedPagePathnamesWithoutHomeDefault.find((path) => startsWith(pathname, path)) || false;
export const isPublicPath = (pathname: string) => !!PublicPagePathnames.find((path) => startsWith(pathname, path)) || false;
