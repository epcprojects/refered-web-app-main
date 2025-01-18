import { asyncGuard, firebaseErrorMsg } from '@/utils/lodash.utils';
import { generateUUID } from '@/utils/misc.utils';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { firebase } from '.';

const StorageFolders = {
  chat: 'ChatImages',
  avatar: 'ProfileImages',
};

export type UploadFile_Body = { file: File; type: keyof typeof StorageFolders };
export type UploadFile_Response = Promise<string>;
export const UploadFile = async (body: UploadFile_Body): UploadFile_Response => {
  const fileRef = ref(firebase.storage, `${StorageFolders[body.type]}/${generateUUID()}`);
  const response = await asyncGuard(() => uploadBytes(fileRef, body.file));
  if (response.error !== null || response.result === null) throw new Error(firebaseErrorMsg(response.error));
  const uploadedUrl = await getDownloadURL(response.result.ref);
  return uploadedUrl;
};
