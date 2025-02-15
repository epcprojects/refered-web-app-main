import { asyncGuard, firebaseErrorMsg } from '@/utils/lodash.utils';
import { generateUUID } from '@/utils/misc.utils';
import { FirebaseError } from 'firebase/app';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { firebase } from '.';

const StorageFolders = {
  chat: 'ChatImages',
  avatar: 'ProfileImages',
  public: 'Public',
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

export type UploadBlob_Body = { userId: string; blob: Blob; type: keyof typeof StorageFolders; ext: 'webp' };
export const uploadBlobToFirebase = async (body: UploadBlob_Body) => {
  const { userId, blob, type, ext } = body;
  const imagePath = `${StorageFolders[type]}/referd_${userId}.${ext}`;
  const imageRef = ref(firebase.storage, imagePath);

  try {
    // Check if the image already exists
    await getDownloadURL(imageRef);
    return await getDownloadURL(imageRef);
  } catch (error) {
    if (error instanceof FirebaseError && (error.code === 'storage/object-not-found' || error.code === '404')) {
      // Upload new image
      const response = await asyncGuard(() => uploadBytes(imageRef, blob));
      if (response.error !== null || response.result === null) throw new Error(firebaseErrorMsg(response.error));

      return await getDownloadURL(response.result.ref);
    }
    throw error;
  }
};
