import { asyncGuard, firebaseErrorMsg } from '@/utils/lodash.utils';
import { addDoc, collection, doc, DocumentReference, getCountFromServer, getDoc, getDocs, limit, orderBy, query, startAfter, Timestamp, updateDoc, where, writeBatch } from 'firebase/firestore';
import { firebase } from '.';
import { IProfile } from './profile';

export interface INotificationType {
  id: string;
  FIRDateTime?: Timestamp;
  datetime: Timestamp;
  description: string;
  fromUser: string;
  fromUserProfile: IProfile | null;
  isRead: '0' | '1';
  isReadFromHeader: '0' | '1';
  subType: string;
  title: string;
  toUser: string;
  type: '1' | '-1';
}

export type GetAllNotificationsCount_Body = { userId: string };
export type GetAllNotificationsCount_Response = Promise<number>;
export const GetAllNotificationsCount = async (body: GetAllNotificationsCount_Body): GetAllNotificationsCount_Response => {
  const response = await asyncGuard(() => getCountFromServer(query(collection(firebase.firestore, firebase.collections.notifications), where('type', '==', '-1'), where('toUser', '==', body.userId))));
  if (response.error !== null || response.result === null) return 0;
  else return response.result.data().count;
};

export type GetAllUnreadNotificationsCount_Body = { userId: string };
export type GetAllUnreadNotificationsCount_Response = Promise<number>;
export const GetAllUnreadNotificationsCount = async (body: GetAllNotificationsCount_Body): GetAllNotificationsCount_Response => {
  const response = await asyncGuard(() => getCountFromServer(query(collection(firebase.firestore, firebase.collections.notifications), where('type', '==', '-1'), where('toUser', '==', body.userId), where('isRead', '==', '0'))));
  if (response.error !== null || response.result === null) return 0;
  else return response.result.data().count;
};

export type GetAllNotifications_Body = { userId: string; lastItemId: string | undefined };
export type GetAllNotifications_Response = Promise<INotificationType[]>;
export const GetAllNotifications = async (body: GetAllNotifications_Body): GetAllNotifications_Response => {
  const lastItemDocSnap = body.lastItemId === undefined ? [] : await getDoc(doc(collection(firebase.firestore, firebase.collections.notifications), body.lastItemId));

  const notificationsResponse = await asyncGuard(() => getDocs(query(collection(firebase.firestore, firebase.collections.notifications), where('toUser', '==', body.userId), where('type', '==', '-1'), orderBy('datetime', 'desc'), startAfter(lastItemDocSnap), limit(firebase.pagination.pageSize))));
  if (notificationsResponse.error !== null || notificationsResponse.result === null) throw new Error(firebaseErrorMsg(notificationsResponse.error));

  const profilesResponse = await asyncGuard(() => getDocs(collection(firebase.firestore, firebase.collections.profile)));
  if (profilesResponse.error !== null || profilesResponse.result === null) throw new Error(firebaseErrorMsg(profilesResponse.error));

  // Extract notifications and profiles
  const notifications = notificationsResponse.result.docs.map((item) => ({ ...item.data(), id: item.id })) as INotificationType[];
  const profiles = profilesResponse.result.docs.map((item) => ({ ...item.data(), id: item.id })) as IProfile[];

  // Filter and join notifications with profiles
  const allNotifications = notifications.map((notification) => {
    const fromUserProfile = profiles.find((profile) => profile.UserId === notification.fromUser) || null;
    return { ...notification, fromUserProfile };
  });

  return allNotifications;
};

export type MarkNotificationAsRead_Body = { id: string };
export type MarkNotificationAsRead_Response = Promise<INotificationType>;
export const MarkNotificationAsRead = async (body: MarkNotificationAsRead_Body): MarkNotificationAsRead_Response => {
  const querySnapshot = await asyncGuard(() => getDoc(doc(firebase.firestore, firebase.collections.notifications, body.id)));
  if (querySnapshot.result === null || querySnapshot.result.exists() === false) throw new Error('Notification not found!');
  if (querySnapshot.result.data().isRead === '1') return querySnapshot.result.data() as INotificationType;

  const docRef = querySnapshot.result.ref;
  const response = await asyncGuard(() => updateDoc(docRef, { isRead: '1' }));
  if (response.error !== null || response.result === null) throw new Error(firebaseErrorMsg(response.error));

  return { ...querySnapshot.result.data(), isRead: '1' } as INotificationType;
};

export type MarkAllHeaderNotificationsAsRead_Body = { toUserId: string };
export type MarkAllHeaderNotificationsAsRead_Response = Promise<void>;
export const MarkAllHeaderNotificationsAsRead = async (body: MarkAllHeaderNotificationsAsRead_Body): MarkAllHeaderNotificationsAsRead_Response => {
  const querySnapshot = await asyncGuard(() => getDocs(query(collection(firebase.firestore, firebase.collections.notifications), where('toUser', '==', body.toUserId), where('isReadFromHeader', '==', '0'))));
  if (querySnapshot.result === null || querySnapshot.result.docs.length <= 0) return;

  const updates: { ref: DocumentReference; data: Record<string, string> }[] = [];
  querySnapshot.result.docs.forEach((doc) => {
    updates.push({ ref: doc.ref, data: { isReadFromHeader: '1' } });
  });

  // because batch update of max 500 documents at a time is possible in firebase
  const chunks = [];
  while (updates.length) {
    chunks.push(updates.splice(0, 500));
  }

  for (const chunk of chunks) {
    const batch = writeBatch(firebase.firestore);
    chunk.forEach((update) => batch.update(update.ref, update.data));
    await batch.commit();
  }
};

export type SendNotification_Body = Omit<INotificationType, 'id' | 'fromUserProfile'>;
export type SendNotification_Response = Promise<void>;
export const SendNotification = async (body: SendNotification_Body): SendNotification_Response => {
  const response = await asyncGuard(() => addDoc(collection(firebase.firestore, firebase.collections.notifications), body));
  if (response.error !== null || response.result === null) throw new Error(firebaseErrorMsg(response.error));
};
