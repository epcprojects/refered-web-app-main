import { asyncGuard, firebaseErrorMsg } from '@/utils/lodash.utils';
import { collection, getDocs } from 'firebase/firestore';
import { firebase } from '.';

export interface IFaqType {
  id: string;
  question: string;
  answer: string;
  order: number;
  type: 'User' | 'Business';
}

export type GetAllFaqs_Response = Promise<{ user: IFaqType[]; business: IFaqType[] }>;
export const GetAllFaqs = async (): GetAllFaqs_Response => {
  const response = await asyncGuard(() => getDocs(collection(firebase.firestore, firebase.collections.faqs)));
  if (response.error !== null || response.result === null) throw new Error(firebaseErrorMsg(response.error));
  const allFaqs = response.result.docs.map((item) => ({ ...item.data(), id: item.id })) as IFaqType[];
  return { user: allFaqs.filter((item) => item.type === 'User').sort((a, b) => a.order - b.order), business: allFaqs.filter((item) => item.type === 'Business').sort((a, b) => a.order - b.order) };
};
