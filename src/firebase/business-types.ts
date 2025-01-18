import { handleGetAllBusinessTypes } from '@/actions/firebase-admin';
import { asyncGuard } from '@/utils/lodash.utils';

export interface IBusinessType {
  id: string;
  name: string;
  description: string;
}

export type GetAllBusinessTypes_Response = Promise<IBusinessType[]>;
export const GetAllBusinessTypes = async (): GetAllBusinessTypes_Response => {
  const response = await asyncGuard(() => handleGetAllBusinessTypes());
  if (response.error !== null || response.result === null) throw new Error(response.error?.toString());
  return response.result;
};
