import { asyncGuard, firebaseErrorMsg } from '@/utils/lodash.utils';
import { detectBrowser, detectPlatform } from '@/utils/user-info.utils';
import { Timestamp } from 'firebase/firestore';
import { getToken, NotificationPayload } from 'firebase/messaging';
import { firebase } from '.';
import { UpdateUserFcmToken } from './profile';

export type GenerateFcmToken_Response = Promise<string>;
export const GenerateFcmToken = async (): GenerateFcmToken_Response => {
  const response = await asyncGuard(() => getToken(firebase.messaging(), { vapidKey: process.env.NEXT_PUBLIC_FIREBASE_CLOUD_MESSAGING_VAPID_KEY }));
  if (response.error !== null || response.result === null) throw new Error(firebaseErrorMsg(response.error));
  const currentToken = response.result;
  return currentToken;
};

export type GenerateAndUpdateProfileFcmToken_Body = { profileId: string };
export type GenerateAndUpdateProfileFcmToken_Response = Promise<string>;
export const GenerateAndUpdateProfileFcmToken = async (body: GenerateAndUpdateProfileFcmToken_Body): GenerateAndUpdateProfileFcmToken_Response => {
  const response = await asyncGuard(() => GenerateFcmToken());
  if (response.error !== null || response.result === null) throw new Error(firebaseErrorMsg(response.error));
  const currentToken = response.result;

  const updateResponse = await asyncGuard(() => UpdateUserFcmToken({ id: body.profileId, FCMToken: [{ token: currentToken, browser: detectBrowser(), platform: detectPlatform(), lastUpdated: Timestamp.now() }] }));
  if (updateResponse.error !== null || updateResponse.result === null) throw new Error(firebaseErrorMsg(response.error));

  return currentToken;
};

export const RegisterServiceWorker = async (onReceiveNotification?: (payload: NotificationPayload) => void) => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const serviceWorkerRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      if (serviceWorkerRegistration) console.log('Service worker registered successfully');

      navigator.serviceWorker.addEventListener('message', (event) => {
        onReceiveNotification?.(event.data.notification);
      });
    } catch (error) {
      console.error('Error during service worker registration:', error);
    }
  } else {
    throw new Error('The browser doesn`t support service worker.');
  }
};
