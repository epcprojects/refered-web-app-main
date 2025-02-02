import { date } from '@/utils/date.utils';
import { asyncGuard, firebaseErrorMsg, generateTokensForSentence, unionBy } from '@/utils/lodash.utils';
import { collection, doc, getDoc, getDocs, limit, orderBy, query, startAfter, Timestamp, updateDoc, where } from 'firebase/firestore';
import { firebase } from '.';
import { IFavorite } from './favorite';
import { IGroupType } from './group-types';

export type IProfileWithFavorites = IProfile & { isFavorite: boolean };
export interface IProfile {
  id: string;
  UserType: 'Business' | 'Normal';
  UserId: string;
  Verified: '1' | '0';
  FCMToken: {
    token: string;
    // deviceId: string;
    platform: string;
    browser: string;
    lastUpdated: Timestamp;
  }[];
  FirstName: string;
  LastName: string;
  PhoneNo: string;
  email: string;
  State?: string;
  City?: string;
  userEmail: string;
  Keywords: string[];
  ImageUrl?: string;
  BusinessId?: string;
  BusinessName?: string;
  BusinessTypeName?: string;
  GroupId?: string;
  groupData?: IGroupType;
  ReferralAmount?: string;
  About?: string;
  ZipCode?: string;
  DiscountPercent?: string;
  cashAppId?: string;
  paypalId?: string;
  venmoId?: string;
}

const getProfileByUserIdQuery = (userId: string) => query(collection(firebase.firestore, firebase.collections.profile), where('UserId', '==', userId));

export type GetProfileData_Body = { id: string };
export type GetProfileData_Response = Promise<IProfile>;
export const GetProfileData = async (body: GetProfileData_Body): GetProfileData_Response => {
  const response = await asyncGuard(() => getDocs(getProfileByUserIdQuery(body.id)));
  if (response.error !== null || response.result === null) throw new Error(firebaseErrorMsg(response.error));
  const profileData = response.result.docs.length <= 0 ? undefined : ({ ...response.result.docs[0].data(), id: response.result.docs[0].id } as IProfile);
  if (profileData === undefined) throw new Error('User not found!');

  if (profileData.GroupId === undefined) return profileData;
  let groupData: IGroupType | undefined = undefined;
  const groupDataResponse = await asyncGuard(() => getDoc(doc(firebase.firestore, firebase.collections.groupTypes, profileData.GroupId || '')));
  if (groupDataResponse.error !== null || groupDataResponse.result === null) groupData = undefined;
  else groupData = { ...groupDataResponse.result.data(), id: groupDataResponse.result.id } as IGroupType;

  return { ...profileData, groupData };
};

export type MarkProfileAsVerified_Body = { id: string };
export type MarkProfileAsVerified_Response = Promise<IProfile>;
export const MarkProfileAsVerified = async (body: MarkProfileAsVerified_Body): MarkProfileAsVerified_Response => {
  const querySnapshot = await getDocs(getProfileByUserIdQuery(body.id));
  if (querySnapshot.docs.length <= 0) throw new Error('User not found!');
  const response = await asyncGuard(() => updateDoc(querySnapshot.docs[0].ref, { Verified: '1' }));
  if (response.error !== null || response.result === null) throw new Error(firebaseErrorMsg(response.error));
  return { ...querySnapshot.docs[0].data(), id: querySnapshot.docs[0].id, Verified: '1' } as IProfile;
};

export type GetAllProfiles_Body = { loggedInUserId: string };
export type GetAllProfiles_Response = Promise<{ users: IProfileWithFavorites[]; businesses: IProfileWithFavorites[] }>;
export const GetAllProfiles = async (body: GetAllProfiles_Body): GetAllProfiles_Response => {
  const profileResponse = await asyncGuard(() => getDocs(collection(firebase.firestore, firebase.collections.profile)));
  if (profileResponse.error !== null || profileResponse.result === null) throw new Error(firebaseErrorMsg(profileResponse.error));

  const favoritesResponse = await asyncGuard(() => getDocs(query(collection(firebase.firestore, firebase.collections.favorites), where('ProfileId', '==', body.loggedInUserId))));
  if (favoritesResponse.error !== null || favoritesResponse.result === null) throw new Error(firebaseErrorMsg(favoritesResponse.error));

  const groupDataResponse = await asyncGuard(() => getDocs(collection(firebase.firestore, firebase.collections.favorites)));
  if (groupDataResponse.error !== null || groupDataResponse.result === null) throw new Error(firebaseErrorMsg(groupDataResponse.error));

  const allFavorites = favoritesResponse.result.docs.map((item) => ({ ...item.data(), id: item.id })) as IFavorite[];
  const allGroups = groupDataResponse.result.docs.map((item) => ({ ...item.data(), id: item.id })) as IGroupType[];
  const allProfiles = profileResponse.result.docs.map((item) => ({ ...item.data(), id: item.id, isFavorite: !!allFavorites.find((fav) => fav.UserId === item.data().UserId), groupData: allGroups.find((group) => group.id === (item.data() as IGroupType).id) })) as IProfileWithFavorites[];

  return { users: allProfiles.filter((item) => item.UserType === 'Normal'), businesses: allProfiles.filter((item) => item.UserType === 'Business') };
};

export type GetProfilesForSearch_Body = { loggedInUserId: string; searchTerm: string; targetType?: IProfile['UserType']; lastItemId: string | undefined };
export type GetProfilesForSearch_Response = Promise<{ users: IProfileWithFavorites[]; businesses: IProfileWithFavorites[] }>;
export const GetProfilesForSearch = async (body: GetProfilesForSearch_Body): GetProfilesForSearch_Response => {
  const favoritesResponse = await asyncGuard(() => getDocs(query(collection(firebase.firestore, firebase.collections.favorites), where('ProfileId', '==', body.loggedInUserId))));
  if (favoritesResponse.error !== null || favoritesResponse.result === null) throw new Error(firebaseErrorMsg(favoritesResponse.error));
  const allFavorites = favoritesResponse.result.docs.map((item) => ({ ...item.data(), id: item.id })) as IFavorite[];

  if (!!body.searchTerm === false && body.targetType === undefined) {
    let userProfiles: IProfileWithFavorites[] = [];
    const userProfilesResponse = await asyncGuard(() => getDocs(query(collection(firebase.firestore, firebase.collections.profile), where('Verified', '==', '1'), where('UserType', '==', 'Normal'), orderBy('FirstName', 'asc'), limit(7))));
    if (userProfilesResponse.result !== null) userProfiles = userProfilesResponse.result.docs.map((item) => ({ ...item.data(), id: item.id, isFavorite: !!allFavorites.find((fav) => fav.UserId === item.data().UserId) })) as IProfileWithFavorites[];
    // userProfiles = userProfiles.filter((item) => item.UserId !== body.loggedInUserId);

    let businessProfiles: IProfileWithFavorites[] = [];
    const businessProfilesResponse = await asyncGuard(() => getDocs(query(collection(firebase.firestore, firebase.collections.profile), where('Verified', '==', '1'), where('UserType', '==', 'Business'), orderBy('FirstName', 'asc'), limit(7))));
    if (businessProfilesResponse.result !== null) businessProfiles = businessProfilesResponse.result.docs.map((item) => ({ ...item.data(), id: item.id, isFavorite: !!allFavorites.find((fav) => fav.UserId === item.data().UserId) })) as IProfileWithFavorites[];
    // businessProfiles = businessProfiles.filter((item) => item.UserId !== body.loggedInUserId);

    return { users: userProfiles, businesses: businessProfiles };
  }

  if (!!body.searchTerm === true && body.targetType === undefined) {
    let userProfiles: IProfileWithFavorites[] = [];
    const userProfilesResponse = await asyncGuard(() => getDocs(query(collection(firebase.firestore, firebase.collections.profile), where('Verified', '==', '1'), where('UserType', '==', 'Normal'), where('Keywords', 'array-contains', body.searchTerm.toLowerCase()), orderBy('FirstName', 'asc'), limit(7))));
    if (userProfilesResponse.result !== null) userProfiles = userProfilesResponse.result.docs.map((item) => ({ ...item.data(), id: item.id, isFavorite: !!allFavorites.find((fav) => fav.UserId === item.data().UserId) })) as IProfileWithFavorites[];
    // userProfiles = userProfiles.filter((item) => item.UserId !== body.loggedInUserId);

    let businessProfiles: IProfileWithFavorites[] = [];
    const businessProfilesResponse = await asyncGuard(() => getDocs(query(collection(firebase.firestore, firebase.collections.profile), where('Verified', '==', '1'), where('UserType', '==', 'Business'), where('Keywords', 'array-contains', body.searchTerm.toLowerCase()), orderBy('FirstName', 'asc'), limit(7))));
    if (businessProfilesResponse.result !== null) businessProfiles = businessProfilesResponse.result.docs.map((item) => ({ ...item.data(), id: item.id, isFavorite: !!allFavorites.find((fav) => fav.UserId === item.data().UserId) })) as IProfileWithFavorites[];
    // businessProfiles = businessProfiles.filter((item) => item.UserId !== body.loggedInUserId);

    return { users: userProfiles, businesses: businessProfiles };
  }

  if (!!body.searchTerm === false && body.targetType !== undefined) {
    const lastItemDocSnap = body.lastItemId === undefined ? [] : await getDoc(doc(collection(firebase.firestore, firebase.collections.profile), body.lastItemId));

    let profiles: IProfileWithFavorites[] = [];
    const profileResponse = await asyncGuard(() => (body.lastItemId === undefined ? getDocs(query(collection(firebase.firestore, firebase.collections.profile), where('Verified', '==', '1'), where('UserType', '==', body.targetType), orderBy('FirstName', 'asc'), limit(firebase.pagination.pageSize))) : getDocs(query(collection(firebase.firestore, firebase.collections.profile), where('UserType', '==', body.targetType), orderBy('FirstName', 'asc'), startAfter(lastItemDocSnap), limit(firebase.pagination.pageSize)))));
    if (profileResponse.result !== null) profiles = profileResponse.result.docs.map((item) => ({ ...item.data(), id: item.id, isFavorite: !!allFavorites.find((fav) => fav.ProfileId === item.data().UserId) })) as IProfileWithFavorites[];
    // profiles =  profiles.filter((item) => item.UserId !== body.loggedInUserId);

    if (body.targetType === 'Normal') return { users: profiles, businesses: [] };
    else return { users: [], businesses: profiles };
  }

  if (!!body.searchTerm === true && body.targetType !== undefined) {
    const lastItemDocSnap = body.lastItemId === undefined ? [] : await getDoc(doc(collection(firebase.firestore, firebase.collections.profile), body.lastItemId));

    let profiles: IProfileWithFavorites[] = [];
    const profileResponse = await asyncGuard(() => (body.lastItemId === undefined ? getDocs(query(collection(firebase.firestore, firebase.collections.profile), where('Verified', '==', '1'), where('UserType', '==', body.targetType), where('Keywords', 'array-contains', body.searchTerm.toLowerCase()), orderBy('FirstName', 'asc'), limit(firebase.pagination.pageSize))) : getDocs(query(collection(firebase.firestore, firebase.collections.profile), where('UserType', '==', body.targetType), where('Keywords', 'array-contains', body.searchTerm.toLowerCase()), orderBy('FirstName', 'asc'), startAfter(lastItemDocSnap), limit(firebase.pagination.pageSize)))));
    if (profileResponse.result !== null) profiles = profileResponse.result.docs.map((item) => ({ ...item.data(), id: item.id, isFavorite: !!allFavorites.find((fav) => fav.ProfileId === item.data().UserId) })) as IProfileWithFavorites[];
    // profiles =  profiles.filter((item) => item.UserId !== body.loggedInUserId);

    if (body.targetType === 'Normal') return { users: profiles, businesses: [] };
    else return { users: [], businesses: profiles };
  }

  return { users: [], businesses: [] };
};

export type GetProfileById_Body = { id: string; loggedInUserId: string };
export type GetProfileById_Response = Promise<IProfileWithFavorites>;
export const GetProfileById = async (body: GetProfileById_Body): GetProfileById_Response => {
  const profileResponse = await asyncGuard(() => getDocs(query(collection(firebase.firestore, firebase.collections.profile), where('UserId', '==', body.id))));
  if (profileResponse.error !== null || profileResponse.result === null || profileResponse.result.docs.length <= 0) throw new Error(firebaseErrorMsg(profileResponse.error));
  const profileResponseData = profileResponse.result.docs[0].data() as IProfile;

  const favoritesResponse = await asyncGuard(() => getDocs(query(collection(firebase.firestore, firebase.collections.favorites), where('ProfileId', '==', body.loggedInUserId))));
  if (favoritesResponse.error !== null || favoritesResponse.result === null) throw new Error(firebaseErrorMsg(favoritesResponse.error));
  const allFavorites = favoritesResponse.result.docs.map((item) => ({ ...item.data(), id: item.id })) as IFavorite[];

  const groupDataResponse = await asyncGuard(() => getDoc(doc(firebase.firestore, firebase.collections.groupTypes, profileResponseData.GroupId || '')));

  const profileData = { ...profileResponseData, isFavorite: !!allFavorites.find((fav) => fav.UserId === profileResponseData.UserId), groupData: groupDataResponse.result === null ? undefined : { ...groupDataResponse.result.data(), id: groupDataResponse.result.id } } as IProfileWithFavorites;
  return profileData;
};

export type UpdatePersonalUserProfile_Body = Pick<IProfile, 'id' | 'FirstName' | 'LastName' | 'userEmail' | 'ImageUrl' | 'GroupId'>;
export type UpdatePersonalUserProfile_Response = Promise<IProfile>;
export const UpdatePersonalUserProfile = async ({ id, ...body }: UpdatePersonalUserProfile_Body): UpdatePersonalUserProfile_Response => {
  const querySnapshot = await getDocs(getProfileByUserIdQuery(id));
  if (querySnapshot.docs.length <= 0) throw new Error('User not found!');
  const response = await asyncGuard(() => updateDoc(querySnapshot.docs[0].ref, { ...body, Keywords: [...generateTokensForSentence([body.FirstName, body.LastName].join(' '))] }));
  if (response.error !== null || response.result === null) throw new Error(firebaseErrorMsg(response.error));
  return { ...querySnapshot.docs[0].data(), id: querySnapshot.docs[0].id, ...body } as IProfile;
};

export type UpdateBusinessUserProfile_Body = Pick<IProfile, 'id' | 'FirstName' | 'LastName' | 'userEmail' | 'ImageUrl' | 'BusinessId' | 'BusinessTypeName' | 'BusinessName' | 'GroupId' | 'About' | 'ReferralAmount' | 'DiscountPercent' | 'ZipCode'>;
export type UpdateBusinessUserProfile_Response = Promise<IProfile>;
export const UpdateBusinessUserProfile = async ({ id, ...body }: UpdateBusinessUserProfile_Body): UpdateBusinessUserProfile_Response => {
  const querySnapshot = await getDocs(getProfileByUserIdQuery(id));
  if (querySnapshot.docs.length <= 0) throw new Error('User not found!');
  const response = await asyncGuard(() => updateDoc(querySnapshot.docs[0].ref, { ...body, Keywords: [...generateTokensForSentence([body.FirstName, body.LastName].join(' ')), ...(!!body.BusinessName ? generateTokensForSentence(body.BusinessName.trim().toLowerCase()) : [])] }));
  if (response.error !== null || response.result === null) throw new Error(firebaseErrorMsg(response.error));
  return { ...querySnapshot.docs[0].data(), id: querySnapshot.docs[0].id, ...body } as IProfile;
};

export type UpdateUserPaymentInfo_Body = Pick<IProfile, 'id' | 'cashAppId' | 'paypalId' | 'venmoId'>;
export type UpdateUserPaymentInfo_Response = Promise<IProfile>;
export const UpdateUserPaymentInfo = async ({ id, ...body }: UpdateUserPaymentInfo_Body): UpdateUserPaymentInfo_Response => {
  const querySnapshot = await getDocs(getProfileByUserIdQuery(id));
  if (querySnapshot.docs.length <= 0) throw new Error('User not found!');
  const response = await asyncGuard(() => updateDoc(querySnapshot.docs[0].ref, body));
  if (response.error !== null || response.result === null) throw new Error(firebaseErrorMsg(response.error));
  return { ...querySnapshot.docs[0].data(), id: querySnapshot.docs[0].id, ...body } as IProfile;
};

export type UpdateUserFcmToken_Body = Pick<IProfile, 'id' | 'FCMToken'>;
export type UpdateUserFcmToken_Response = Promise<IProfile>;
export const UpdateUserFcmToken = async ({ id, ...body }: UpdateUserFcmToken_Body): UpdateUserFcmToken_Response => {
  const profileResponse = await asyncGuard(() => getDoc(doc(firebase.firestore, firebase.collections.profile, id)));
  if (profileResponse.error !== null || profileResponse.result === null) throw new Error('User not found!');
  const result = profileResponse.result;
  const resultData = profileResponse.result.data() as IProfile;

  let compiledFcmTokens = [];
  const hasFCMToken = !!(resultData.FCMToken || []).find((item) => item.browser === body.FCMToken[0].browser && item.platform === body.FCMToken[0].platform);
  if (hasFCMToken) compiledFcmTokens = (resultData.FCMToken || []).map((item) => (item.browser === body.FCMToken[0].browser && item.platform === body.FCMToken[0].platform ? body.FCMToken[0] : item));
  else compiledFcmTokens = unionBy(resultData.FCMToken || [], body.FCMToken);

  // delete expired tokens
  compiledFcmTokens = compiledFcmTokens.filter((item) => date.differenceInDays(new Date(), date.fromUnixTime(item.lastUpdated.seconds)) < 15);

  const response = await asyncGuard(() => updateDoc(result.ref, { FCMToken: compiledFcmTokens }));
  if (response.error !== null || response.result === null) throw new Error(firebaseErrorMsg(response.error));
  return { ...result.data(), id: result.id, ...body } as IProfile;
};
