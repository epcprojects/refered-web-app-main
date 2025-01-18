export const getAllDesktopPlatforms = () => ['Windows', 'macOS', 'Linux'];
export const getEdgeBrowserName = () => 'Microsoft Edge';

export const detectPlatform = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('win')) return 'Windows';
  else if (userAgent.includes('mac')) return 'macOS';
  else if (userAgent.includes('linux') && !userAgent.includes('android')) return 'Linux';
  else if (userAgent.includes('android')) return 'Android';
  else if (userAgent.includes('iphone')) return 'iPhone';
  else if (userAgent.includes('ipad')) return 'iPad';
  else if (userAgent.includes('ipod')) return 'iPod';
  else return 'Unknown Platform';
};

export const detectBrowser = () => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Edg')) return 'Microsoft Edge';
  else if (userAgent.includes('OPR') || userAgent.includes('Opera')) return 'Opera';
  else if (userAgent.includes('Chrome')) return 'Google Chrome';
  else if (userAgent.includes('Firefox')) return 'Mozilla Firefox';
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Apple Safari';
  else if (userAgent.includes('Trident') || userAgent.includes('MSIE')) return 'Internet Explorer';
  else return 'Unknown Browser';
};
