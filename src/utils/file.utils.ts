const ConvertMBstoBytes = (MBs: number) => MBs * (1024 * 1024);
const allowedImageFormats = ['png', 'jpg', 'gif', 'webp'];

const isMIMETypeAllowed = (targetMIME: string, allowedFormats: string[]) => Object.keys(fileTypesMIME).includes(targetMIME) && allowedFormats.includes(fileTypesMIME[targetMIME]);
const fileTypesMIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

export const file = { allowedImageFormats, isMIMETypeAllowed, ConvertMBstoBytes };
