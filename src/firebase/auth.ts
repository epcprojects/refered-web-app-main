import { handleCheckIfUserExists, handleDeleteInCompleteUser } from '@/actions/firebase-admin';
import { firebase } from '@/firebase';
import { globalStore } from '@/stores/app-global-store';
import { file } from '@/utils/file.utils';
import { asyncGuard, firebaseErrorMsg, generateTokensForSentence } from '@/utils/lodash.utils';
import { ConfirmationResult, createUserWithEmailAndPassword, deleteUser, EmailAuthProvider, linkWithPhoneNumber, signInWithCredential, signInWithPhoneNumber, signOut, updatePassword, User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { GetProfileData, IProfile, MarkProfileAsVerified } from './profile';
import { UploadFile, uploadOGImageToFirebase } from './upload';

// +1 Added for USA format
export const handleDeformatPhoneNumberForAPI = (phoneNo: string) => (phoneNo === undefined ? '' : `+1${phoneNo.replace(/[^0-9]/g, '')}`);
export const handleConvertPhoneToEmailForAPI = (phoneNo: string) => `${handleDeformatPhoneNumberForAPI(phoneNo)}@getreferd.co`;

export type SignupBusiness_Body = Pick<IProfile, 'UserType' | 'FirstName' | 'LastName' | 'PhoneNo' | 'email' | 'ImageUrl' | 'BusinessId' | 'BusinessName' | 'BusinessTypeName' | 'State' | 'City'> & { password: string; profileImageFile?: File | null };
export type SignupBusiness_Response = Promise<{ isSuccess: boolean }>;
export const SignupBusiness = async (body: Omit<SignupBusiness_Body, 'UserType'>): SignupBusiness_Response => {
  await handleDeleteInCompleteUser(handleConvertPhoneToEmailForAPI(body.PhoneNo));

  const response = await asyncGuard(() => createUserWithEmailAndPassword(firebase.auth, handleConvertPhoneToEmailForAPI(body.PhoneNo), body.password));
  if (response.error !== null || response.result === null) throw new Error(firebaseErrorMsg(response.error));
  const signedUpUser = response.result.user;

  let imageUrl = '';

  //Making sure to upload profile picture after sign-in.
  if (body.profileImageFile) {
    try {
      const uploadedUrl = await UploadFile({ file: body.profileImageFile, type: 'avatar' });
      imageUrl = uploadedUrl;

      const canvas = await file.generateShareableCard({
        src: uploadedUrl,
        title: (body.FirstName + ' ' + body.LastName).trim(),
        headline: `${body.BusinessTypeName ?? body.City} • ${body.BusinessName ?? body.State}`,
      });

      if (canvas) {
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          await asyncGuard(() => uploadOGImageToFirebase({ blob: blob, userId: signedUpUser.uid, ext: 'webp', type: 'public' }));
        }, 'image/webp');
      }
    } catch (error) {
      console.error('Error uploading DP:', error);
      await deleteUser(signedUpUser);
      throw new Error(firebaseErrorMsg('Error uploading profile picture'));
    }
  }

  const profileDataCompiled: Omit<IProfile, 'id'> = {
    UserType: 'Business',
    UserId: signedUpUser.uid,
    Verified: '0',
    FCMToken: [],
    FirstName: body.FirstName,
    LastName: body.LastName,
    PhoneNo: body.PhoneNo,
    email: handleConvertPhoneToEmailForAPI(body.PhoneNo),
    State: body.State,
    City: body.City,
    userEmail: body.email,
    BusinessId: body.BusinessId,
    BusinessName: body.BusinessName,
    BusinessTypeName: body.BusinessTypeName,
    ImageUrl: imageUrl,
    Keywords: [...generateTokensForSentence([body.FirstName, body.LastName].join(' ')), ...(!!body.BusinessName ? generateTokensForSentence(body.BusinessName.trim().toLowerCase()) : []), ...(!!body.BusinessTypeName ? generateTokensForSentence(body.BusinessTypeName.trim().toLowerCase()) : [])],
    ReferralAmount: process.env.NEXT_PUBLIC_DEFAULT_REFERRAL_AMOUNT || '5',
  };
  const updateProfileResponse = await asyncGuard(() => setDoc(doc(firebase.firestore, firebase.collections.profile, signedUpUser.uid), profileDataCompiled));
  if (updateProfileResponse.error !== null || updateProfileResponse.result === null) {
    await deleteUser(signedUpUser);
    throw new Error(firebaseErrorMsg(updateProfileResponse.error));
  }

  const credential = EmailAuthProvider.credential(handleConvertPhoneToEmailForAPI(body.PhoneNo), body.password);
  globalStore.setState({ emailAuthCredential: credential });

  return { isSuccess: true };
};

export type SignupPersonal_Body = Pick<IProfile, 'UserType' | 'ImageUrl' | 'FirstName' | 'LastName' | 'PhoneNo' | 'email' | 'State' | 'City'> & { password: string; profileImageFile?: File | null };
export type SignupPersonal_Response = Promise<{ isSuccess: boolean }>;
export const SignupPersonal = async (body: Omit<SignupPersonal_Body, 'UserType'>): SignupPersonal_Response => {
  await handleDeleteInCompleteUser(handleConvertPhoneToEmailForAPI(body.PhoneNo));

  const response = await asyncGuard(() => createUserWithEmailAndPassword(firebase.auth, handleConvertPhoneToEmailForAPI(body.PhoneNo), body.password));
  if (response.error !== null || response.result === null) throw new Error(firebaseErrorMsg(response.error));
  const signedUpUser = response.result.user;

  let imageUrl = '';

  //Making sure to upload profile picture after sign-in.
  if (body.profileImageFile) {
    try {
      const uploadedUrl = await UploadFile({ file: body.profileImageFile, type: 'avatar' });
      imageUrl = uploadedUrl;

      const canvas = await file.generateShareableCard({
        src: uploadedUrl,
        title: (body.FirstName + ' ' + body.LastName).trim(),
      });

      if (canvas) {
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          await asyncGuard(() => uploadOGImageToFirebase({ blob: blob, userId: signedUpUser.uid, ext: 'webp', type: 'public' }));
        }, 'image/webp');
      }
    } catch (error) {
      console.error('Error uploading DP:', error);
      await deleteUser(signedUpUser);
      throw new Error(firebaseErrorMsg('Error uploading profile picture'));
    }
  }

  const profileDataCompiled: Omit<IProfile, 'id'> = {
    UserType: 'Normal',
    UserId: signedUpUser.uid,
    Verified: '0',
    FCMToken: [],
    FirstName: body.FirstName,
    LastName: body.LastName,
    PhoneNo: body.PhoneNo,
    email: handleConvertPhoneToEmailForAPI(body.PhoneNo),
    State: body.State,
    City: body.City,
    userEmail: body.email,
    ImageUrl: imageUrl,
    Keywords: [...generateTokensForSentence([body.FirstName, body.LastName].join(' '))],
  };

  const updateProfileResponse = await asyncGuard(() => setDoc(doc(firebase.firestore, firebase.collections.profile, signedUpUser.uid), profileDataCompiled));
  if (updateProfileResponse.error !== null || updateProfileResponse.result === null) {
    await deleteUser(signedUpUser);
    throw new Error(firebaseErrorMsg(updateProfileResponse.error));
  }

  const credential = EmailAuthProvider.credential(handleConvertPhoneToEmailForAPI(body.PhoneNo), body.password);
  globalStore.setState({ emailAuthCredential: credential });

  return { isSuccess: true };
};

export type Signin_Body = Pick<IProfile, 'PhoneNo'> & { password: string };
export type Signin_Response = Promise<{ user: User; profile: IProfile }>;
export const Signin = async (body: Signin_Body): Signin_Response => {
  await handleDeleteInCompleteUser(handleConvertPhoneToEmailForAPI(body.PhoneNo));

  const credential = EmailAuthProvider.credential(handleConvertPhoneToEmailForAPI(body.PhoneNo), body.password);
  const response = await asyncGuard(() => signInWithCredential(firebase.auth, credential));
  if (response.error !== null || response.result === null) throw new Error(firebaseErrorMsg(response.error));
  const currentUser = response.result.user;

  const getProfileResponse = await asyncGuard(() => GetProfileData({ id: currentUser.uid }));
  if (getProfileResponse.error !== null || getProfileResponse.result === null) {
    await signOut(firebase.auth);
    throw new Error(firebaseErrorMsg(getProfileResponse.error));
  }

  if (getProfileResponse.result.Verified === '0') globalStore.setState({ emailAuthCredential: credential });
  else globalStore.setState({ emailAuthCredential: null });

  return { user: currentUser, profile: getProfileResponse.result };
};

export type Signout_Response = Promise<void>;
export const Signout = async (): Signout_Response => {
  const response = await asyncGuard(() => signOut(firebase.auth));
  if (response.error !== null || response.result === null) throw new Error(firebaseErrorMsg(response.error));
  else globalStore.setState({ currentUser: null });
};

export type ForgotPassword_Body = Pick<IProfile, 'PhoneNo'>;
export type ForgotPassword_Response = Promise<void>;
export const ForgotPassword = async (body: ForgotPassword_Body): ForgotPassword_Response => {
  const response = await asyncGuard(() => handleCheckIfUserExists(handleConvertPhoneToEmailForAPI(body.PhoneNo)));
  if (response.error !== null || response.result === null) return;
  else if (response.result === false) throw new Error('User not found!');
};

export type ResetPassword_Body = { user: User; password: string };
export type ResetPassword_Response = Promise<void>;
export const ResetPassword = async (body: ResetPassword_Body): ResetPassword_Response => {
  const response = await asyncGuard(() => updatePassword(body.user, body.password));
  if (response.error !== null || response.result === null) throw new Error(firebaseErrorMsg(response.error));
};

export type SendOTP_Body = Pick<IProfile, 'PhoneNo'>;
export type SendOTP_Response = Promise<ConfirmationResult>;
export const SendOTP = async (body: SendOTP_Body): SendOTP_Response => {
  const credential = globalStore.getState().emailAuthCredential;
  if (credential === null) throw new Error('Session expired!');

  const signInWithCredentialResponse = await asyncGuard(() => signInWithCredential(firebase.auth, credential));
  if (signInWithCredentialResponse.error !== null || signInWithCredentialResponse.result === null) throw new Error(firebaseErrorMsg(signInWithCredentialResponse.error));
  const currentUser = signInWithCredentialResponse.result.user;

  const response = await asyncGuard(() => linkWithPhoneNumber(currentUser, body.PhoneNo, window.recaptchaVerifier));
  if (response.error !== null || response.result === null) throw new Error(firebaseErrorMsg(response.error));
  return response.result;
};

export type VerifyOTP_Body = Pick<IProfile, 'PhoneNo'> & { confirmationResult: ConfirmationResult; otp: string };
export type VerifyOTP_Response = Promise<{ isSuccess: boolean }>;
export const VerifyOTP = async (body: VerifyOTP_Body): VerifyOTP_Response => {
  const response = await asyncGuard(() => body.confirmationResult.confirm(body.otp));
  if (response.error !== null || response.result === null) throw new Error(firebaseErrorMsg(response.error));
  const currentUser = response.result.user;

  const updateProfileResponse = await asyncGuard(() => MarkProfileAsVerified({ id: currentUser.uid }));
  if (updateProfileResponse.error !== null || updateProfileResponse.result === null) throw new Error(firebaseErrorMsg(updateProfileResponse.error));

  globalStore.setState({ isVerifiedRecently: true, currentUser: currentUser, currentUserProfile: updateProfileResponse.result, emailAuthCredential: null });

  return { isSuccess: true };
};

export type SendForgotPasswordOTP_Body = Pick<IProfile, 'PhoneNo'>;
export type SendForgotPasswordOTP_Response = Promise<ConfirmationResult>;
export const SendForgotPasswordOTP = async (body: SendForgotPasswordOTP_Body): SendForgotPasswordOTP_Response => {
  const response = await asyncGuard(() => signInWithPhoneNumber(firebase.auth, `${body.PhoneNo}`, window.recaptchaVerifier));
  if (response.error !== null || response.result === null) throw new Error(firebaseErrorMsg(response.error));
  return response.result;
};

export type VerifyForgotPasswordOTP_Body = Pick<IProfile, 'PhoneNo'> & { confirmationResult: ConfirmationResult; otp: string };
export type VerifyForgotPasswordOTP_Response = Promise<{ isSuccess: boolean }>;
export const VerifyForgotPasswordOTP = async (body: VerifyForgotPasswordOTP_Body): VerifyForgotPasswordOTP_Response => {
  const response = await asyncGuard(() => body.confirmationResult.confirm(body.otp));
  if (response.error !== null || response.result === null) throw new Error(firebaseErrorMsg(response.error));

  globalStore.setState({ isResetPasswordSignin: true, currentUser: response.result.user });

  return { isSuccess: true };
};
