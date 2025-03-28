import { profilePaymentInfoFormSchemaType } from '@/containers/profile-edit/profile-edit-form-payment-info';
import { date } from '@/utils/date.utils';
import { asyncGuard, firebaseErrorMsg, generateTokensForSentence } from '@/utils/lodash.utils';
import { and, collection, doc, getDoc, getDocs, limit, or, orderBy, query, startAfter, Timestamp, updateDoc, where } from 'firebase/firestore';
import { firebase } from '.';
import { IFavorite } from './favorite';
import { IGroupType } from './group-types';
import { GetMutualFavouritesForProfile } from './referral';

export type IProfileWithFavorites = IProfile & { isFavorite: boolean; mutualFavourites?: IFavorite[] };
export interface IProfile {
  id: string;
  uid?: string;
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
  default?: profilePaymentInfoFormSchemaType['type'];
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

//TODO: Refactor this to include Referrals by favourites.
export type GetProfilesForSearch_Body = {
  loggedInUserId?: string;

  targetType?: IProfile['UserType'];
  lastItemId?: string;
} & ISearchFilters;

type ISearchFilters = {
  searchTerm?: string;
  state?: string;
  city?: string;
};

export const getAllFavoritesForProfile = async (profileId: string) => {
  const favoritesResponse = await asyncGuard(() => getDocs(query(collection(firebase.firestore, firebase.collections.favorites), where('ProfileId', '==', profileId))));
  const allFavorites = favoritesResponse.result?.docs.map((item) => ({ ...item.data(), id: item.id })) as IFavorite[] | undefined;
  
  return allFavorites || []
};

export type GetProfilesForSearch_Response = Promise<{
  users: IProfileWithFavorites[];
  businesses: IProfileWithFavorites[];
}>;

export const GetProfilesForSearch = async (body: GetProfilesForSearch_Body): GetProfilesForSearch_Response => {


  const fetchProfiles = async (userType: string) => {
    let queryConstraints: any[] = [];

    // Base constraints
    queryConstraints.push(where('Verified', '==', '1'));
    queryConstraints.push(where('UserType', '==', userType));

    // Search constraints
    if (body.searchTerm && body.searchTerm.trim() !== '') {
      const searchTermLower = body.searchTerm.toLowerCase();
        queryConstraints.push(
          or(
            where('Keywords', 'array-contains', searchTermLower),
          )
        );
    }

    // Location constraints
    if (body.state) {
      queryConstraints.push(where('State', '==', body.state));
    }
    if (body.city) {
      queryConstraints.push(where('City', '==', body.city));
    }

    // Create the query with all constraints
    let queryRef = query(
      collection(firebase.firestore, firebase.collections.profile),
      and(...queryConstraints),
      orderBy('FirstName', 'asc'),
      limit(firebase.pagination.pageSize)
    );

    // Add pagination if needed
    if (body.lastItemId && typeof body.lastItemId === 'string') {
      const lastItemDocSnap = await getDoc(doc(firebase.firestore, firebase.collections.profile, body.lastItemId));
      if (lastItemDocSnap.exists()) {
        queryRef = query(queryRef, startAfter(lastItemDocSnap));
      }
    }

    const profileResponse = await asyncGuard(() => getDocs(queryRef));

    if (profileResponse.result === null) return [];

    return Promise.all(
      profileResponse.result.docs.map(async (item) => {
        const data = item.data();
        return {
          ...data,
          id: item.id
    
        };
      }),
    ) as Promise<IProfileWithFavorites[]>;
  };

  if (!body.targetType) {
    return {
      users: await fetchProfiles('Normal'),
      businesses: await fetchProfiles('Business'),
    };
  }

  return body.targetType === 'Normal' ? { users: await fetchProfiles('Normal'), businesses: [] } : { users: [], businesses: await fetchProfiles('Business') };
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

  // Fetching mutual favourites for other profiles.
  const { result: mutualFavourites } = await asyncGuard(() =>
    GetMutualFavouritesForProfile({
      profileUserId: profileResponseData.UserId,
      userId: body.loggedInUserId,
      lastItemId: undefined,
    }),
  );

  const profileData = { ...profileResponseData, isFavorite: !!allFavorites.find((fav) => fav.UserId === profileResponseData.UserId), groupData: groupDataResponse.result === null ? undefined : { ...groupDataResponse.result.data(), id: groupDataResponse.result.id }, mutualFavourites } as IProfileWithFavorites;
  return profileData;
};

export type UpdatePersonalUserProfile_Body = Pick<IProfile, 'id' | 'FirstName' | 'LastName' | 'userEmail' | 'City' | 'State' | 'ImageUrl' | 'GroupId'>;
export type UpdatePersonalUserProfile_Response = Promise<IProfile>;
export const UpdatePersonalUserProfile = async ({ id, ...body }: UpdatePersonalUserProfile_Body): UpdatePersonalUserProfile_Response => {
  const querySnapshot = await getDocs(getProfileByUserIdQuery(id));
  if (querySnapshot.docs.length <= 0) throw new Error('User not found!');
  const response = await asyncGuard(() => updateDoc(querySnapshot.docs[0].ref, { ...body, Keywords: [...generateTokensForSentence([body.FirstName, body.LastName].join(' '))] }));
  if (response.error !== null || response.result === null) throw new Error(firebaseErrorMsg(response.error));
  return { ...querySnapshot.docs[0].data(), id: querySnapshot.docs[0].id, ...body } as IProfile;
};

export type UpdateBusinessUserProfile_Body = Pick<IProfile, 'id' | 'FirstName' | 'LastName' | 'userEmail' | 'ImageUrl' | 'BusinessId' | 'BusinessTypeName' | 'BusinessName' | 'City' | 'State' | 'GroupId' | 'About' | 'ReferralAmount' | 'DiscountPercent' | 'ZipCode'>;
export type UpdateBusinessUserProfile_Response = Promise<IProfile>;
export const UpdateBusinessUserProfile = async ({ id, ...body }: UpdateBusinessUserProfile_Body): UpdateBusinessUserProfile_Response => {
  const querySnapshot = await getDocs(getProfileByUserIdQuery(id));
  if (querySnapshot.docs.length <= 0) throw new Error('User not found!');
  const response = await asyncGuard(() => updateDoc(querySnapshot.docs[0].ref, { ...body, 
    Keywords: [...generateTokensForSentence([body.FirstName, body.LastName].join(' ')), ...(!!body.BusinessName ? generateTokensForSentence(body.BusinessName.trim().toLowerCase()) : []), ...(!!body.BusinessTypeName ? generateTokensForSentence(body.BusinessTypeName.trim().toLowerCase()) : [])],
   }));
  if (response.error !== null || response.result === null) throw new Error(firebaseErrorMsg(response.error));
  return { ...querySnapshot.docs[0].data(), id: querySnapshot.docs[0].id, ...body } as IProfile;
};

export type UpdateUserPaymentInfo_Body = Pick<IProfile, 'id' | 'cashAppId' | 'paypalId' | 'venmoId' | 'default'>;
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

  // Extract the FCM token details from the body
  const newFcmToken = body.FCMToken[0];

  // Check if the token for the given browser already exists
  const existingTokenIndex = (resultData.FCMToken || []).findIndex((item) => item.browser === newFcmToken.browser);

  let compiledFcmTokens = [];

  if (existingTokenIndex !== -1) {
    // If token for the same browser exists, replace it
    compiledFcmTokens = (resultData.FCMToken || []).map((item, index) => (index === existingTokenIndex ? newFcmToken : item));
  } else {
    // If token for the browser doesn't exist, replace it with original
    compiledFcmTokens = [newFcmToken];
  }

  // Delete expired tokens (e.g., older than 15 days)
  compiledFcmTokens = compiledFcmTokens.filter((item) => date.differenceInDays(new Date(), date.fromUnixTime(item.lastUpdated.seconds)) < 15);

  // Update the Firestore document with the new FCM tokens
  const response = await asyncGuard(() => updateDoc(result.ref, { FCMToken: compiledFcmTokens }));
  if (response.error !== null || response.result === null) throw new Error(firebaseErrorMsg(response.error));

  return { ...result.data(), id: result.id, ...body } as IProfile;
};
