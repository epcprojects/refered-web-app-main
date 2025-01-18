import { v4 } from 'uuid';

export const getClientOS = () => (Boolean(typeof navigator !== 'undefined' && navigator.userAgent.indexOf('Mac') !== -1) ? 'MAC' : 'WIN');
export const isMobileBrowser = () => Boolean(/Mobi|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent));
export const scrollToBottom = (options?: { behavior: 'smooth' | 'instant' }) => window.scrollTo({ top: document.body.scrollHeight, behavior: options?.behavior || 'smooth' });
export const generateUUID = () => v4();
