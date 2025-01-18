import { asyncGuard, firebaseErrorMsg } from '@/utils/lodash.utils';
import { addDoc, collection } from 'firebase/firestore';
import { firebase } from '.';

export interface IContact {
  id: string;
  subject: string;
  message: string;
  userId: string;
}

export type SubmitContact_Body = Omit<IContact, 'id'>;
export type SubmitContact_Response = Promise<{ isSuccess: boolean }>;
export const SubmitContact = async (data: SubmitContact_Body): SubmitContact_Response => {
  const response = await asyncGuard(() => addDoc(collection(firebase.firestore, firebase.collections.contact), data));
  if (response.error !== null || response.result === null) throw new Error(firebaseErrorMsg(response.error));
  return { isSuccess: true };
};
