import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging } from 'firebase/messaging';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGE_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const messaging = () => getMessaging(app);
const firestore = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

const pagination = {
  pageSize: 20,
};

enum collections {
  profile = 'Profile',
  businessTypes = 'BusinessTypes',
  faqs = 'FAQs',
  contact = 'Contact',
  notifications = 'Notifications',
  chatGroups = 'MessageGroup',
  chats = 'Messages',
  favorites = 'Favorites',
  referrals = 'Refferals',
  groupTypes = 'GroupTypes',
}

export const firebase = { app, firestore, auth, storage, collections, pagination, messaging };
