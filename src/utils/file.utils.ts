import { IProfileWithFavorites } from '@/firebase/profile';

const ConvertMBstoBytes = (MBs: number) => MBs * (1024 * 1024);
const allowedImageFormats = ['png', 'jpg', 'gif', 'webp'];

const isMIMETypeAllowed = (targetMIME: string, allowedFormats: string[]) => Object.keys(fileTypesMIME).includes(targetMIME) && allowedFormats.includes(fileTypesMIME[targetMIME]);
const fileTypesMIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = `/api/proxy?url=${encodeURIComponent(src)}`;
  });
};

// Generate the profile image with background
const generateShareableCard = async (data: IProfileWithFavorites) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const backgroundSrc = '/images/bg-refered.png'; // Background Image
  const profileSrc = data.ImageUrl; // User's Profile Picture
  const overlaySize = 256;

  if (!profileSrc) return null;

  const background = new Image();
  background.src = backgroundSrc;

  const profile = await loadImage(profileSrc);

  canvas.width = background.width;
  canvas.height = background.height;

  // Draw Background
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  // Circular Profile Image Positioning
  const x = (canvas.width - overlaySize) / 2;
  const y = (canvas.height - overlaySize) / 2;
  const radius = overlaySize / 2;

  // Draw White Circle Background for Profile Image
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fillStyle = 'white'; // Set the fill color to white
  ctx.fill(); // Fill the circle with white
  ctx.restore();

  // Draw Circular Profile Image
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(profile, x, y, overlaySize, overlaySize);
  ctx.restore();

  // White Stroke Around Profile Image
  ctx.beginPath();
  ctx.arc(x + radius, y + radius, radius + 3, 0, Math.PI * 2);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 6;
  ctx.stroke();

  // Text Styling
  ctx.font = 'normal 32px Arial';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 4;

  // Add User Name Below Image
  const nameY = y + overlaySize + 40; // Adjusted for spacing
  ctx.fillText(data.FirstName, canvas.width / 2, nameY);

  if (data.BusinessTypeName || data.BusinessName) {
    ctx.font = '18px Arial'; // Smaller font size for subtitle
    const titleY = nameY + 35; // Slightly below the name
    ctx.fillText(data.BusinessTypeName + ' • ' + data.BusinessName, canvas.width / 2, titleY);
  }
  return canvas;
};

export const file = { allowedImageFormats, isMIMETypeAllowed, ConvertMBstoBytes, generateShareableCard };
