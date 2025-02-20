import { asyncGuard, firebaseErrorMsg } from '@/utils/lodash.utils';
import { generateUUID } from '@/utils/misc.utils';
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

export const uploadOGImageToFirebase = async (body: UploadBlob_Body) => {
  const { userId, blob, type, ext } = body;
  const imagePath = `${StorageFolders[type]}/og_image_${userId}.${ext}`;
  const imageRef = ref(firebase.storage, imagePath);

  try {
    // Upload new image (this will replace any existing file)
    const response = await asyncGuard(() => uploadBytes(imageRef, blob));
    if (response.error !== null || response.result === null) throw new Error(firebaseErrorMsg(response.error));

    // Return the download URL of the uploaded image
    return await getDownloadURL(response.result.ref);
  } catch (error) {
    throw error; // Rethrow any errors that occur during upload
  }
};
