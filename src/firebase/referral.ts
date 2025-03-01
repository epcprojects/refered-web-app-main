import { handleSendPushNotification } from '@/actions/firebase-admin';
import { asyncGuard, firebaseErrorMsg } from '@/utils/lodash.utils';
import { addDoc, collection, doc, getDoc, getDocs, limit, orderBy, query, startAfter, Timestamp, updateDoc, where } from 'firebase/firestore';
import { firebase } from '.';
import { GetOrCreateChatGroup } from './chat';
import { GetAllFavoritesByUserId, GetAllWhoFavouriteThisUser, IFavorite } from './favorite';
import { SendNotification } from './notifications';
import { IProfile } from './profile';

export interface IReferral {
  id: string;
  referredByUserId: string;
  referredToUserId: string;
  referredBusinessUserId: string;
  isRedeemed: '0' | '1';
  datetime: Timestamp;
  messageGroupId?: string;
  referredByUser?: IProfile;
  referredToUser?: IProfile;
  referredBusinessUser?: IProfile;
}

export type GetAllReferralsByUserId_Body = { userId: string; lastItemId: string | undefined };
export type GetAllReferralsByUserId_Response = Promise<IReferral[]>;
// export const GetAllReferralsByUserId = async (body: GetAllReferralsByUserId_Body): GetAllReferralsByUserId_Response => {
//   const lastItemDocSnap = body.lastItemId === undefined ? [] : await getDoc(doc(collection(firebase.firestore, firebase.collections.referrals), body.lastItemId));

//   // prettier-ignore
//   const queries = [
//     query(collection(firebase.firestore, firebase.collections.referrals), where('referredByUserId', '==', body.userId), orderBy('datetime', 'desc'), startAfter(lastItemDocSnap), limit(firebase.pagination.pageSize)),
//     query(collection(firebase.firestore, firebase.collections.referrals), where('referredToUserId', '==', body.userId), orderBy('datetime', 'desc'), startAfter(lastItemDocSnap), limit(firebase.pagination.pageSize)),
//     query(collection(firebase.firestore, firebase.collections.referrals), where('referredBusinessUserId', '==', body.userId), orderBy('datetime', 'desc'), startAfter(lastItemDocSnap), limit(firebase.pagination.pageSize))
//   ];

//   const allReferralsResponse = await asyncGuard(() => Promise.all(queries.map(getDocs)));
//   if (allReferralsResponse.error !== null || allReferralsResponse.result === null) throw new Error(firebaseErrorMsg(allReferralsResponse.error));

//   const allProfilesResponse = await asyncGuard(() => getDocs(query(collection(firebase.firestore, firebase.collections.profile))));
//   if (allProfilesResponse.error !== null || allProfilesResponse.result === null) throw new Error('Something went wrong!');

//   const allProfiles = (allProfilesResponse.result.docs.map((item) => ({ ...item.data(), id: item.id })) as IProfile[]) || [];
//   const allReferrals = ([...allReferralsResponse.result[0].docs, ...allReferralsResponse.result[1].docs, ...allReferralsResponse.result[2].docs].map((item) => ({ ...item.data(), id: item.id })) as IReferral[]) || [];
//   const allReferralsWithProfile = allReferrals.map((item) => ({ ...item, referredByUser: allProfiles.find((profile) => profile.UserId === item.referredByUserId), referredToUser: allProfiles.find((profile) => profile.UserId === item.referredToUserId), referredBusinessUser: allProfiles.find((profile) => profile.UserId === item.referredBusinessUserId) }));

//   return allReferralsWithProfile;
// };

export const GetAllReferralsByUserId = async (body: GetAllReferralsByUserId_Body): GetAllReferralsByUserId_Response => {
  const lastItemDocSnap = body.lastItemId === undefined ? [] : await getDoc(doc(collection(firebase.firestore, firebase.collections.referrals), body.lastItemId));

  const queries = [query(collection(firebase.firestore, firebase.collections.referrals), where('referredByUserId', '==', body.userId), orderBy('datetime', 'desc'), startAfter(lastItemDocSnap), limit(firebase.pagination.pageSize)), query(collection(firebase.firestore, firebase.collections.referrals), where('referredToUserId', '==', body.userId), orderBy('datetime', 'desc'), startAfter(lastItemDocSnap), limit(firebase.pagination.pageSize)), query(collection(firebase.firestore, firebase.collections.referrals), where('referredBusinessUserId', '==', body.userId), orderBy('datetime', 'desc'), startAfter(lastItemDocSnap), limit(firebase.pagination.pageSize))];

  const allReferralsResponse = await asyncGuard(() => Promise.all(queries.map(getDocs)));
  if (allReferralsResponse.error !== null || allReferralsResponse.result === null) throw new Error(firebaseErrorMsg(allReferralsResponse.error));

  const allProfilesResponse = await asyncGuard(() => getDocs(query(collection(firebase.firestore, firebase.collections.profile))));
  if (allProfilesResponse.error !== null || allProfilesResponse.result === null) throw new Error('Something went wrong!');

  const allProfiles = (allProfilesResponse.result.docs.map((item) => ({ ...item.data(), id: item.id })) as IProfile[]) || [];
  // const allReferrals = ([...allReferralsResponse.result[0].docs, ...allReferralsResponse.result[1].docs, ...allReferralsResponse.result[2].docs].map((item) => ({ ...item.data(), id: item.id })) as IReferral[]) || [];
  const allReferrals =
    [...allReferralsResponse.result[0].docs, ...allReferralsResponse.result[1].docs, ...allReferralsResponse.result[2].docs].map((item) => ({ ...item.data(), id: item.id }) as IReferral).sort((a, b) => (b.datetime.seconds || 0) - (a.datetime.seconds || 0)) || // Ensure sorting after merging
    [];

  // Fetch group data for each profile
  const fetchGroupData = async (profile?: IProfile) => {
    if (profile?.GroupId) {
      const groupDataResult = await asyncGuard(() => getDoc(doc(firebase.firestore, firebase.collections.groupTypes, profile.GroupId || '')));
      return groupDataResult.result?.data() || null;
    }
    return null;
  };

  const allReferralsWithProfile = await Promise.all(
    allReferrals.map(async (item) => {
      const referredByUser = allProfiles.find((profile) => profile.UserId === item.referredByUserId);
      const referredToUser = allProfiles.find((profile) => profile.UserId === item.referredToUserId);
      const referredBusinessUser = allProfiles.find((profile) => profile.UserId === item.referredBusinessUserId);

      return {
        ...item,
        referredByUser: { ...referredByUser },
        referredToUser: { ...referredToUser },
        referredBusinessUser: { ...referredBusinessUser, groupData: await fetchGroupData(referredBusinessUser) },
      };
    }),
  );

  return allReferralsWithProfile as IReferral[];
};

export type GetProfileReferralsByUserFavourites_Body = { profileUserId: string; userId: string; lastItemId: string | undefined };
export type GetProfileReferralsByUserFavourites_Response = Promise<IReferral[]>;
export const GetMutualFavouritesForProfile = async (body: GetProfileReferralsByUserFavourites_Body): Promise<IFavorite[]> => {
  if (body.profileUserId === body.userId) return [];

  // My favourites List
  const { result: userFavourites, error: userFavouritesError } = await asyncGuard(() =>
    GetAllFavoritesByUserId({
      userId: body.userId, //Auth user id
      lastItemId: undefined,
    }),
  );

  if (userFavouritesError !== null || userFavourites === null) throw new Error('Something went wrong!');
  const favouritesCompiled: IFavorite[] = [];

  //If my favourites found
  if (userFavourites.length) {
    const { result: usersWhoFavourite } = await asyncGuard(() =>
      GetAllWhoFavouriteThisUser({
        userId: body.profileUserId,
        lastItemId: undefined,
      }),
    );

    if (usersWhoFavourite) {
      userFavourites.forEach((myfavourite) => {
        usersWhoFavourite.forEach((userWhoFavourite) => {
          if (myfavourite?.email === userWhoFavourite?.email) {
            favouritesCompiled.push(userWhoFavourite);
          }
        });
      });
    }
  }

  return favouritesCompiled;
};

export type RedeemReferral_Body = { id: string; referralData: IReferral };
export type RedeemReferral_Response = Promise<{ isSuccess: true }>;
export const RedeemReferral = async (body: RedeemReferral_Body): RedeemReferral_Response => {
  const querySnapshot = await asyncGuard(() => getDoc(doc(firebase.firestore, firebase.collections.referrals, body.id)));
  if (querySnapshot.result === null || querySnapshot.result.exists() === false) throw new Error('Referral not found!');

  const docRef = querySnapshot.result.ref;
  const response = await asyncGuard(() => updateDoc(docRef, { isRedeemed: '1' }));
  if (response.error !== null || response.result === null) throw new Error(firebaseErrorMsg(response.error));

  const notificationTitle = `Referral ${[body.referralData.referredBusinessUser?.FirstName, body.referralData.referredBusinessUser?.LastName].join(' ').trim()} (${body.referralData.referredBusinessUser?.BusinessName}) has been redeemed`;
  const notificationDescription = `Referral has been redeemed. ${[body.referralData.referredBusinessUser?.FirstName, body.referralData.referredBusinessUser?.LastName].join(' ').trim()} (${body.referralData.referredBusinessUser?.BusinessName}) has been made aware to make referral payment of $${body.referralData.referredBusinessUser?.ReferralAmount}`;
  const result = await asyncGuard(() => SendNotification({ toUser: body.referralData.referredByUserId, datetime: Timestamp.now(), FIRDateTime: !!body.referralData.referredBusinessUser?.FCMToken ? Timestamp.now() : undefined, title: notificationTitle, description: notificationDescription, fromUser: body.referralData.referredToUserId, isRead: '0', isReadFromHeader: '0', subType: '', type: '-1' }));
  if (!!body.referralData.referredByUser?.FCMToken) await asyncGuard(() => handleSendPushNotification({ tokens: body.referralData.referredByUser?.FCMToken.map((item) => item.token) || [], title: notificationTitle, body: notificationDescription }));

  return { isSuccess: true };
};

export type CreateReferral_Body = Omit<IReferral, 'id' | 'referredByUser' | 'referredToUser' | 'referredBusinessUser' | 'messageGroupId'> & { referredToUserProfileData: IProfile };
export type CreateReferral_Response = Promise<{ isSuccess: boolean }>;
export const CreateReferral = async ({ referredToUserProfileData, ...body }: CreateReferral_Body): CreateReferral_Response => {
  let isBusinessAlreadyReferred = false;

  const getReferralResponse = await asyncGuard(() => getDocs(query(collection(firebase.firestore, firebase.collections.referrals), where('referredBusinessUserId', '==', body.referredBusinessUserId), where('referredToUserId', '==', body.referredToUserId))));
  if (getReferralResponse.result !== null) isBusinessAlreadyReferred = !!getReferralResponse.result.docs.find((item) => (item.data() as IReferral).isRedeemed === '0');
  if (isBusinessAlreadyReferred) return { isSuccess: false };

  const isValidBusinessProfileResponse = await asyncGuard(() => getDocs(query(collection(firebase.firestore, firebase.collections.profile), where('UserId', '==', body.referredBusinessUserId))));
  if (isValidBusinessProfileResponse.error !== null || isValidBusinessProfileResponse.result === null || isValidBusinessProfileResponse.result.docs.length <= 0) throw new Error();

  const isValidReferredByProfileResponse = await asyncGuard(() => getDocs(query(collection(firebase.firestore, firebase.collections.profile), where('UserId', '==', body.referredByUserId))));
  if (isValidReferredByProfileResponse.error !== null || isValidReferredByProfileResponse.result === null || isValidReferredByProfileResponse.result.docs.length <= 0) throw new Error();

  let messageGroupId = '';
  const businessProfileData = isValidBusinessProfileResponse.result.docs[0].data() as IProfile;
  const messageGroupIdResponse = await asyncGuard(() => GetOrCreateChatGroup({ fromUser: referredToUserProfileData, toUser: { UserId: body.referredBusinessUserId, FirstName: businessProfileData.FirstName, LastName: businessProfileData.LastName } }));
  if (messageGroupIdResponse.result !== null) messageGroupId = messageGroupIdResponse.result.id;

  const response = await asyncGuard(() => addDoc(collection(firebase.firestore, firebase.collections.referrals), { ...body, messageGroupId }));
  if (response.error !== null || response.result === null) throw new Error(firebaseErrorMsg(response.error));
  return { isSuccess: true };
};

export type UpdateReferralChatGroupId_Body = Pick<IReferral, 'id' | 'messageGroupId'>;
export type UpdateReferralChatGroupId_Response = Promise<void>;
export const UpdateReferralChatGroupId = async (body: UpdateReferralChatGroupId_Body): UpdateReferralChatGroupId_Response => {
  const querySnapshot = await asyncGuard(() => getDoc(doc(firebase.firestore, firebase.collections.referrals, body.id)));
  if (querySnapshot.result === null || querySnapshot.result.exists() === false) return;

  const docRef = querySnapshot.result.ref;
  const response = await asyncGuard(() => updateDoc(docRef, { messageGroupId: body.messageGroupId }));
  if (response.error !== null || response.result === null) return;
};
