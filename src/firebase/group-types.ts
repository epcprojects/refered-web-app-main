import { asyncGuard, firebaseErrorMsg } from '@/utils/lodash.utils';
import { collection, getDocs } from 'firebase/firestore';
import { firebase } from '.';

export interface IGroupType {
  id: string;
  name: string;
}

export type GetAllGroupTypes_Response = Promise<IGroupType[]>;
export const GetAllGroupTypes = async (): GetAllGroupTypes_Response => {
  const response = await asyncGuard(() => getDocs(collection(firebase.firestore, firebase.collections.groupTypes)));
  if (response.error !== null || response.result === null) throw new Error(firebaseErrorMsg(response.error));
  return response.result.docs.map((item) => ({ ...item.data(), id: item.id })) as IGroupType[];
};
