'use client';

import { GenerateAndUpdateProfileFcmToken } from '@/firebase/fcm';
import { globalStore } from '@/stores/app-global-store';
import { detectBrowser, getEdgeBrowserName } from '@/utils/user-info.utils';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const toastId = 'notification-permission-notification';
const loadingToastId = 'loading-toast';

export const useNotificationPermission = () => {
  const [isClosed, setIsClosed] = useState(false);
  const [isAllowed, setIsAllowed] = useState(typeof window === 'undefined' || !('Notification' in window) ? 'default' : Notification.permission);

  const CanRequestForNotificationPermission = () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    if (isAllowed !== 'default') return false;
    if (globalStore.getState().currentUserProfile === null) return false;
    if (isClosed) return false;
    return true;
  };

  const handleRefreshFCMtoken = async (isForcefullyAllowed?: boolean, showToast?: boolean) => {
    if (globalStore.getState().currentUserProfile !== null && (isForcefullyAllowed || isAllowed === 'granted')) {
      // if (showToast) toast.loading('Processing notifications permission...', { id: loadingToastId });
      await GenerateAndUpdateProfileFcmToken({ profileId: globalStore.getState().currentUserProfile?.id || '' });
      // if (showToast) {
      //   toast.dismiss(loadingToastId);
      //   toast.success('Notifications enabled!');
      // }
    }
  };

  const RequestForPermission = () => {
    if (isAllowed === 'granted') handleRefreshFCMtoken(false, true);
    else if (CanRequestForNotificationPermission() === false) return;
    else if (detectBrowser() === getEdgeBrowserName()) toast('Enable Notifications!', { description: 'To enable notifications, goto browser settings then allow notification permissions and then reload the page to receive push notifications.' });
    else {
      toast('Notification permission!', {
        id: toastId,
        description: 'Please allow us to send notifications to your device',
        duration: Infinity,
        closeButton: true,
        onDismiss: () => setIsClosed(true),
        action: {
          label: 'Allow',
          onClick: async () => {
            try {
              const result = await Notification.requestPermission();
              setIsAllowed(result);
              if (result === 'denied') {
                return; // toast.success("Notifications denied!")
              } else {
                toast.loading('Processing notifications permission...', { id: loadingToastId });
                try {
                  await handleRefreshFCMtoken(true);
                  toast.dismiss(loadingToastId);
                  toast.success('Notifications enabled!');
                } catch (err) {
                  toast.dismiss(loadingToastId);
                  toast.success('Please refresh the page to enable notifications!');
                }
              }
            } catch (error) {
              console.error('Error requesting notification permission:', error);
            }
          },
        },
      });
    }
  };

  useEffect(() => {
    RequestForPermission();
  }, [globalStore.getState().currentUserProfile]);
};
