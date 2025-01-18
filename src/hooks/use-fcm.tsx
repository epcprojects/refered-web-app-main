'use client';

import { AppPages } from '@/constants/app-pages.constants';
import { firebase } from '@/firebase';
import { IChatNotificationPayload } from '@/firebase/chat';
import { RegisterServiceWorker } from '@/firebase/fcm';
import { startsWith } from '@/utils/lodash.utils';
import { MessagePayload, onMessage } from 'firebase/messaging';
import { useEffect } from 'react';
import { toast } from 'sonner';

export const useFCM = () => {
  const handleShowToast = (payload: MessagePayload) => {
    const isChatPage = startsWith(window.location.pathname, AppPages.CHATS);
    const isNotificationsPage = startsWith(window.location.pathname, AppPages.NOTIFICATIONS);
    const chatGroupId = window.location.pathname.split('/')[2];
    const payloadDataType = (payload.data as IChatNotificationPayload)?.type || '';
    const payloadDataChatGroupId = (payload.data as IChatNotificationPayload)?.chatGroupId || '';

    if (isChatPage && !!chatGroupId && payloadDataType === 'chat' && payloadDataChatGroupId === chatGroupId) return;
    if (isChatPage && !!chatGroupId === false && payloadDataType === 'chat') return;
    if (isNotificationsPage) return;
    toast(payload.notification?.title, { description: payload.notification?.body });
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const unsubscribe = onMessage(firebase.messaging(), (payload) => handleShowToast(payload));
      return () => unsubscribe();
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator && Notification.permission === 'granted') RegisterServiceWorker();
  }, []);
};
