import { handleSendPushNotification } from '@/actions/firebase-admin';
import { asyncGuard, firebaseErrorMsg, unionBy } from '@/utils/lodash.utils';
import { addDoc, collection, doc, DocumentReference, getCountFromServer, getDoc, getDocs, limit, orderBy, query, startAfter, Timestamp, updateDoc, where, writeBatch } from 'firebase/firestore';
import { firebase } from '.';
import { IProfile } from './profile';

export type IChatNotificationPayload = { type: 'chat'; chatGroupId: string };
export interface IChatGroup {
  id: string;
  createdBy: string;
  createdByName: string;
  modifiedat: Timestamp;
  participants: string[];
  type: '2';
  recentMessage?: IChatMessageText['body'] | IChatMessageImage['body'];
  recentMessageReadBy: string[];
  fromUserProfile: IProfile | null;
  from: {
    senderId: string;
    senderImageUrl: string;
    senderName: string;
  };
  toUserProfile: IProfile | null;
  to: {
    userId: string;
    userName: string;
  };
  fromUserUnreadMessagesCount: number;
  toUserUnreadMessagesCount: number;
  fromUserReadFromHeader: '0' | '1';
  toUserReadFromHeader: '0' | '1';
}

interface IChatMessageCommon {
  id: string;
  datetime: Timestamp;
  from: { senderId: string; senderImageUrl: string; senderName: string };
  groupId: string;
}

interface IChatMessageText {
  body: { text: string; type: 'text' };
  type: 'text';
}

interface IChatMessageImage {
  body: { type: 'image'; attachmentURL: string };
  type: 'image';
}

export type IChatMessage = (IChatMessageText | IChatMessageImage) & IChatMessageCommon;

export type GetAllChatGroupsCount_Body = { userId: string };
export type GetAllChatGroupsCount_Response = Promise<number>;
export const GetAllChatGroupsCount = async (body: GetAllChatGroupsCount_Body): GetAllChatGroupsCount_Response => {
  const response = await asyncGuard(() => getCountFromServer(query(collection(firebase.firestore, firebase.collections.chatGroups), where('participants', 'array-contains', body.userId))));
  if (response.error !== null || response.result === null) return 0;
  else return response.result.data().count;
};

export type GetAllChatGroups_Body = { userId: string; lastItemId: string | undefined };
export type GetAllChatGroups_Response = Promise<IChatGroup[]>;
export const GetAllChatGroups = async (body: GetAllChatGroups_Body): GetAllChatGroups_Response => {
  const lastItemDocSnap = body.lastItemId === undefined ? [] : await getDoc(doc(collection(firebase.firestore, firebase.collections.chatGroups), body.lastItemId));

  const chatGroupsResponse = await asyncGuard(() => getDocs(query(collection(firebase.firestore, firebase.collections.chatGroups), where('participants', 'array-contains', body.userId), orderBy('modifiedat', 'desc'), startAfter(lastItemDocSnap), limit(firebase.pagination.pageSize))));
  if (chatGroupsResponse.error !== null || chatGroupsResponse.result === null) throw new Error(firebaseErrorMsg(chatGroupsResponse.error));

  const profilesResponse = await asyncGuard(() => getDocs(collection(firebase.firestore, firebase.collections.profile)));
  if (profilesResponse.error !== null || profilesResponse.result === null) throw new Error(firebaseErrorMsg(profilesResponse.error));

  // Extract chat groups and profiles
  const chatGroups = chatGroupsResponse.result.docs.map((item) => ({ ...item.data(), id: item.id })) as IChatGroup[];
  const profiles = profilesResponse.result.docs.map((item) => ({ ...item.data(), id: item.id })) as IProfile[];

  // Filter and join chat groups with profiles
  const allChatGroups = chatGroups.map((chatGroup) => {
    const toUserProfile = profiles.find((profile) => profile.UserId === chatGroup.to.userId) || null;
    const fromUserProfile = profiles.find((profile) => profile.UserId === chatGroup.from.senderId) || null;
    return { ...chatGroup, toUserProfile, fromUserProfile };
  });

  return allChatGroups;
};

export type GetChatGroupById_Body = { groupId: string };
export type GetChatGroupById_Response = Promise<IChatGroup>;
export const GetChatGroupById = async (body: GetChatGroupById_Body): GetChatGroupById_Response => {
  const chatGroupResponse = await asyncGuard(() => getDoc(doc(firebase.firestore, firebase.collections.chatGroups, body.groupId)));
  if (chatGroupResponse.error !== null || chatGroupResponse.result === null) throw new Error(firebaseErrorMsg(chatGroupResponse.error));
  const chatGroup = { ...chatGroupResponse.result?.data(), id: chatGroupResponse.result.id } as IChatGroup;

  const toProfilesResponse = await asyncGuard(() => getDocs(query(collection(firebase.firestore, firebase.collections.profile), where('UserId', '==', chatGroup.to.userId))));
  const fromProfilesResponse = await asyncGuard(() => getDocs(query(collection(firebase.firestore, firebase.collections.profile), where('UserId', '==', chatGroup.from.senderId))));

  const compiled = { ...chatGroup, toUserProfile: toProfilesResponse.result === null || toProfilesResponse.result.docs.length <= 0 ? null : { ...toProfilesResponse.result.docs[0].data(), id: toProfilesResponse.result.docs[0].id }, fromUserProfile: fromProfilesResponse.result === null || fromProfilesResponse.result.docs.length <= 0 ? null : { ...fromProfilesResponse.result.docs[0].data(), id: fromProfilesResponse.result.docs[0].id } } as IChatGroup;
  return compiled;
};

export type GetChatMessagesByGroupId_Body = { groupId: string; lastItemId: string | undefined };
export type GetChatMessagesByGroupId_Response = Promise<IChatMessage[]>;
export const GetChatMessagesByGroupId = async (body: GetChatMessagesByGroupId_Body): GetChatMessagesByGroupId_Response => {
  const lastItemDocSnap = body.lastItemId === undefined ? [] : await getDoc(doc(collection(firebase.firestore, firebase.collections.chats), body.lastItemId));

  const chatMessagesResponse = await asyncGuard(() => getDocs(query(collection(firebase.firestore, firebase.collections.chats), where('groupId', '==', body.groupId), orderBy('datetime', 'desc'), startAfter(lastItemDocSnap), limit(firebase.pagination.pageSize))));
  if (chatMessagesResponse.error !== null || chatMessagesResponse.result === null) throw new Error(firebaseErrorMsg(chatMessagesResponse.error));

  const allChatMessages = chatMessagesResponse.result.docs.map((item) => ({ ...item.data(), id: item.id })) as IChatMessage[];
  return allChatMessages;
};

export type UpdateRecentMessageForGroup_Body = { groupId: string; recentMessage: IChatGroup['recentMessage']; modifiedat: IChatGroup['modifiedat']; userId: string; toUserId: string };
export type UpdateRecentMessageForGroup_Response = Promise<void>;
export const UpdateRecentMessageForGroup = async (body: UpdateRecentMessageForGroup_Body): UpdateRecentMessageForGroup_Response => {
  const querySnapshot = await asyncGuard(() => getDoc(doc(firebase.firestore, firebase.collections.chatGroups, body.groupId)));
  if (querySnapshot.result === null || querySnapshot.result.exists() === false) return;

  const docRef = querySnapshot.result.ref;
  const docData = querySnapshot.result.data();
  let dataToUpdate: Partial<IChatGroup> = { recentMessage: body.recentMessage, modifiedat: body.modifiedat, recentMessageReadBy: [body.userId] };
  if (docData.from.senderId === body.toUserId) dataToUpdate = { ...dataToUpdate, fromUserReadFromHeader: '0', fromUserUnreadMessagesCount: (docData.fromUserUnreadMessagesCount || 0) + 1 };
  else if (docData.to.userId === body.toUserId) dataToUpdate = { ...dataToUpdate, toUserReadFromHeader: '0', toUserUnreadMessagesCount: (docData.toUserUnreadMessagesCount || 0) + 1 };

  const response = await asyncGuard(() => updateDoc(docRef, dataToUpdate));
  if (response.error !== null || response.result === null) return;
};

export type MarkRecentMessageForGroupAsRead_Body = { groupId: string; userId: string };
export type MarkRecentMessageForGroupAsRead_Response = Promise<void>;
export const MarkRecentMessageForGroupAsRead = async (body: MarkRecentMessageForGroupAsRead_Body): MarkRecentMessageForGroupAsRead_Response => {
  const querySnapshot = await asyncGuard(() => getDoc(doc(firebase.firestore, firebase.collections.chatGroups, body.groupId)));
  if (querySnapshot.result === null || querySnapshot.result.exists() === false) return;

  const docRef = querySnapshot.result.ref;
  const docData = querySnapshot.result.data() as IChatGroup;
  let dataToUpdate: Partial<IChatGroup> = { recentMessageReadBy: unionBy(docData.recentMessageReadBy, [body.userId]) };
  if (docData.from.senderId === body.userId) dataToUpdate = { ...dataToUpdate, fromUserUnreadMessagesCount: 0 };
  else if (docData.to.userId === body.userId) dataToUpdate = { ...dataToUpdate, toUserUnreadMessagesCount: 0 };

  const response = await asyncGuard(() => updateDoc(docRef, dataToUpdate));
  if (response.error !== null || response.result === null) return;
};

export type MarkAllHeaderChatGroupsAsRead_Body = { userId: string };
export type MarkAllHeaderChatGroupsAsRead_Response = Promise<void>;
export const MarkAllHeaderChatGroupsAsRead = async (body: MarkAllHeaderChatGroupsAsRead_Body): MarkAllHeaderChatGroupsAsRead_Response => {
  const fromUserQuerySnapshot = await asyncGuard(() => getDocs(query(collection(firebase.firestore, firebase.collections.chatGroups), where('from.senderId', '==', body.userId), where('fromUserReadFromHeader', '==', '0'))));
  const fromData = fromUserQuerySnapshot.result?.docs || [];

  const toUserQuerySnapshot = await asyncGuard(() => getDocs(query(collection(firebase.firestore, firebase.collections.chatGroups), where('to.userId', '==', body.userId), where('toUserReadFromHeader', '==', '0'))));
  const toData = toUserQuerySnapshot.result?.docs || [];

  const updates: { ref: DocumentReference; data: Record<string, string> }[] = [];
  fromData.forEach((doc) => {
    updates.push({ ref: doc.ref, data: { fromUserReadFromHeader: '1' } });
  });

  toData.forEach((doc) => {
    updates.push({ ref: doc.ref, data: { toUserReadFromHeader: '1' } });
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

export type SendChatMessage_Body = Omit<IChatMessage, 'id'> & { toFcmTokens: string[]; toUserId: string };
export type SendChatMessage_Response = Promise<{ id: string }>;
export const SendChatMessage = async ({ toFcmTokens, toUserId, ...body }: SendChatMessage_Body): SendChatMessage_Response => {
  const response = await asyncGuard(() => addDoc(collection(firebase.firestore, firebase.collections.chats), body));
  if (response.error !== null || response.result === null) throw new Error(firebaseErrorMsg(response.error));

  UpdateRecentMessageForGroup({ groupId: body.groupId, recentMessage: body.body, modifiedat: body.datetime, userId: body.from.senderId, toUserId: toUserId });
  // SendNotification({ toUser: toUserId, datetime: Timestamp.now(), FIRDateTime: !!toFcmToken ? Timestamp.now() : undefined, title: `${body.from.senderName} sent a new message`, description: body.body.type === 'text' ? body.body.text : 'Sent an image', fromUser: body.from.senderId, isRead: '0', isReadFromHeader: '0', subType: '', type: '-1' });
  if (!!toFcmTokens && toFcmTokens.length > 0) handleSendPushNotification({ tokens: toFcmTokens, title: `${body.from.senderName} sent a new message`, body: body.body.type === 'text' ? body.body.text : 'Sent an image', data: { type: 'chat', chatGroupId: body.groupId } as IChatNotificationPayload });
  return { id: response.result.id };
};

export type GetOrCreateChatGroup_Body = { fromUser: IProfile; toUser: Pick<IProfile, 'UserId' | 'FirstName' | 'LastName'> };
export type GetOrCreateChatGroup_Response = Promise<{ id: string }>;
export const GetOrCreateChatGroup = async (body: GetOrCreateChatGroup_Body): GetOrCreateChatGroup_Response => {
  const existingChatGroupResponse = await asyncGuard(() => getDocs(query(collection(firebase.firestore, firebase.collections.chatGroups), where('participants', 'array-contains', body.fromUser.UserId))));
  if (existingChatGroupResponse.result !== null && existingChatGroupResponse.result.docs.length >= 1) {
    const filteredByToUser = existingChatGroupResponse.result.docs.filter((item) => (item.data() as IChatGroup).participants.includes(body.toUser.UserId));
    if (filteredByToUser.length > 0) return { id: filteredByToUser[0].id };
  }

  const chatGroupToAdd: Omit<IChatGroup, 'id' | 'toUserProfile' | 'fromUserProfile'> = { createdBy: body.fromUser.id, createdByName: [body.fromUser.FirstName, body.fromUser.LastName].join(' ').trim(), participants: [body.fromUser.UserId, body.toUser.UserId], modifiedat: Timestamp.now(), recentMessageReadBy: [], to: { userId: body.toUser.UserId, userName: [body.toUser.FirstName, body.toUser.LastName].join(' ').trim() }, type: '2', from: { senderId: body.fromUser.UserId, senderImageUrl: body.fromUser.ImageUrl || '', senderName: [body.fromUser.FirstName, body.fromUser.LastName].join(' ').trim() }, fromUserReadFromHeader: '0', fromUserUnreadMessagesCount: 0, toUserReadFromHeader: '0', toUserUnreadMessagesCount: 0 };
  const response = await asyncGuard(() => addDoc(collection(firebase.firestore, firebase.collections.chatGroups), chatGroupToAdd));
  if (response.error !== null || response.result === null) throw new Error(firebaseErrorMsg(response.error));
  else return { id: response.result.id };
};
