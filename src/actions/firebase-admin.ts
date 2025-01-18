'use server';

import { firebase } from '@/firebase';
import { IBusinessType } from '@/firebase/business-types';
import { asyncGuard, firebaseErrorMsg } from '@/utils/lodash.utils';
import admin from 'firebase-admin';

let app: admin.app.App;
if (admin.apps.length > 0) app = admin.app();
else {
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_JSON || '{}');
  app = admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const messaging = app.messaging();
const firestore = app.firestore();

export const handleSendPushNotification = async ({ tokens, title, body, data }: { tokens: string[]; title: string; body: string; data?: Record<string, string> }) => {
  const response = await asyncGuard(() => messaging.sendEachForMulticast({ tokens, notification: { title, body }, data }));
  if (response.error !== null && response.result === null) throw new Error(firebaseErrorMsg(response.error));
};

export const handleGetAllBusinessTypes = async () => {
  const response = await asyncGuard(() => firestore.collection(firebase.collections.businessTypes).get());
  if (response.error !== null || response.result === null) throw new Error(firebaseErrorMsg(response.error));
  return response.result.docs.map((item) => ({ ...item.data(), id: item.id })) as IBusinessType[];
};

export const handleDeleteInCompleteUser = async (authEmail: string) => {
  const authUserResponse = await asyncGuard(() => admin.auth().getUserByEmail(authEmail));
  if (authUserResponse.error !== null || authUserResponse.result === null) return;

  const response = await asyncGuard(() => firestore.collection(firebase.collections.profile).where('email', '==', authEmail).get());
  if (response.error !== null || response.result === null) return;
  else if (response.result.docs.length <= 0) await admin.auth().deleteUser(authUserResponse.result.uid);
};

export const handleDeleteUser = async (authEmail: string) => {
  const authUserResponse = await asyncGuard(() => admin.auth().getUserByEmail(authEmail));
  if (authUserResponse.error !== null || authUserResponse.result === null) return;
  await admin.auth().deleteUser(authUserResponse.result.uid);

  const response = await asyncGuard(() => firestore.collection(firebase.collections.profile).where('email', '==', authEmail).get());
  if (response.error !== null || response.result === null || response.result.docs.length <= 0) return;
  else await firestore.collection(firebase.collections.profile).doc(response.result.docs[0].id).delete();
};

export const handleCheckIfUserExists = async (authEmail: string): Promise<boolean> => {
  const authUserResponse = await asyncGuard(() => admin.auth().getUserByEmail(authEmail));
  if (authUserResponse.error !== null || authUserResponse.result === null) return false;
  else return true;
};
