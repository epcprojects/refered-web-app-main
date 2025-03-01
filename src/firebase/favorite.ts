import { asyncGuard, firebaseErrorMsg } from '@/utils/lodash.utils';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, Timestamp, where } from 'firebase/firestore';
import { firebase } from '.';
import { IProfile } from './profile';

export interface IFavorite extends Pick<IProfile, 'City' | 'State' | 'BusinessId' | 'BusinessName' | 'BusinessTypeName' | 'FirstName' | 'LastName' | 'ImageUrl' | 'UserId' | 'UserType' | 'email'> {
  id: string;
  ProfileId: string;
  favoritedAt: Timestamp;
}

export type GetAllFavoritesByUserId_Body = { userId: string; lastItemId: string | undefined };
export type GetAllFavoritesByUserId_Response = Promise<IFavorite[]>;
export const GetAllFavoritesByUserId = async (body: GetAllFavoritesByUserId_Body): GetAllFavoritesByUserId_Response => {
  const lastItemDocSnap = body.lastItemId === undefined ? [] : await getDoc(doc(collection(firebase.firestore, firebase.collections.favorites), body.lastItemId));

  // const response = await asyncGuard(() => getDocs(query(collection(firebase.firestore, firebase.collections.favorites), where('ProfileId', '==', body.userId), orderBy('favoritedAt', 'asc'), startAfter(lastItemDocSnap), limit(firebase.pagination.pageSize))));
  const response = await asyncGuard(() => getDocs(query(collection(firebase.firestore, firebase.collections.favorites), where('ProfileId', '==', body.userId), orderBy('favoritedAt', 'asc'))));
  if (response.error !== null || response.result === null) throw new Error(firebaseErrorMsg(response.error));

  const profileResponse = await asyncGuard(() => getDocs(collection(firebase.firestore, firebase.collections.profile)));
  if (profileResponse.error !== null || profileResponse.result === null) throw new Error(firebaseErrorMsg(profileResponse.error));
  const allProfiles = profileResponse.result.docs.map((item) => ({ ...item.data(), id: item.id })) as IProfile[];

  const resultCompiled = (response.result.docs.map((item) => ({ ...(allProfiles.find((profile) => profile.UserId === item.data().UserId) || {}), ...item.data(), id: item.id })) as IFavorite[]) || [];
  return resultCompiled;
};

export const GetAllWhoFavouriteThisUser = async (body: GetAllFavoritesByUserId_Body): GetAllFavoritesByUserId_Response => {
  const response = await asyncGuard(() => getDocs(query(collection(firebase.firestore, firebase.collections.favorites), where('UserId', '==', body.userId), orderBy('favoritedAt', 'asc'))));
  if (response.error !== null || response.result === null) throw new Error(firebaseErrorMsg(response.error));

  const profileResponse = await asyncGuard(() => getDocs(collection(firebase.firestore, firebase.collections.profile)));
  if (profileResponse.error !== null || profileResponse.result === null) throw new Error(firebaseErrorMsg(profileResponse.error));
  const allProfiles = profileResponse.result.docs.map((item) => ({ ...item.data(), id: item.id })) as IProfile[];

  const resultCompiled = (response.result.docs.map((item) => ({ ...(allProfiles.find((profile) => profile.UserId === item.data().ProfileId) || {}), id: item.id })) as IFavorite[]) || [];
  return resultCompiled;
};

export type ToggleMarkFavorite_Body = { userId: string; toggleFavoriteUserId: string };
export type ToggleMarkFavorite_Response = Promise<{ isSuccess: boolean }>;
export const ToggleMarkFavorite = async (body: ToggleMarkFavorite_Body): ToggleMarkFavorite_Response => {
  const response = await asyncGuard(() => getDocs(query(collection(firebase.firestore, firebase.collections.favorites), where('ProfileId', '==', body.userId), where('UserId', '==', body.toggleFavoriteUserId), orderBy('ProfileId', 'asc'))));
  if (response.error !== null || response.result === null) throw new Error(firebaseErrorMsg(response.error));

  if (response.result.docs.length > 0) {
    const docRef = response.result.docs[0].ref;
    const markUnfavoriteResponse = await asyncGuard(() => deleteDoc(docRef));
    if (markUnfavoriteResponse.error !== null || markUnfavoriteResponse.result === null) throw new Error(firebaseErrorMsg(markUnfavoriteResponse.error));
  } else {
    const favoriteBody: Pick<IFavorite, 'ProfileId' | 'UserId' | 'favoritedAt'> = { ProfileId: body.userId, UserId: body.toggleFavoriteUserId, favoritedAt: Timestamp.now() };
    const markFavoriteResponse = await asyncGuard(() => addDoc(collection(firebase.firestore, firebase.collections.favorites), favoriteBody));
    if (markFavoriteResponse.error !== null || markFavoriteResponse.result === null) throw new Error(firebaseErrorMsg(markFavoriteResponse.error));
  }

  return { isSuccess: true };
};
