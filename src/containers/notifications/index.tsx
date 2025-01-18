'use client';

import EmptyList from '@/components/common/empty-list';
import AppPageLayout from '@/components/layout/app-page-layout';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { firebase } from '@/firebase';
import { GetAllNotifications, GetAllUnreadNotificationsCount, INotificationType, MarkAllHeaderNotificationsAsRead } from '@/firebase/notifications';
import { useAppStore } from '@/hooks/use-app-store';
import { asyncGuard, unionBy } from '@/utils/lodash.utils';
import { useEventListener } from '@/utils/use-hooks.utils';
import { collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import NotificationDialog from './notification-dialog';

interface IProps {}

const NotificationsIndex: React.FC<IProps> = () => {
  const globalStore = useAppStore('Global');

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isAllFetched, setIsAllFetched] = useState(false);
  const [count, setCount] = useState(0);
  const [data, setData] = useState<INotificationType[]>([]);
  const [isFetchingCount, setIsFetchingCount] = useState(true);
  const [isFetchingData, setIsFetchingData] = useState(true);

  const handleMarkedAsRead = (id: string) => {
    setData((prev) => prev.map((item) => (item.id === id ? { ...item, isRead: '1' } : item)));
    setCount((prev) => prev - 1);
  };
  const handleFetchNotificationsCount = async (isFollowUp?: boolean) => {
    if (!isFollowUp) setIsFetchingCount(true);
    const response = await asyncGuard(() => GetAllUnreadNotificationsCount({ userId: globalStore?.currentUser?.uid || '' }));
    if (response.result !== null) setCount(response.result);
    if (!isFollowUp) setIsFetchingCount(false);
  };

  const handleFetchNotificationsData = async () => {
    setIsFetchingData(true);
    const response = await asyncGuard(() => GetAllNotifications({ userId: globalStore?.currentUser?.uid || '', lastItemId: data.length <= 0 ? undefined : data[data.length - 1].id }));
    if (response.error !== null || response.result === null) toast.error(response.error?.toString() || 'Something went wrong!');
    else {
      setData((prev) => unionBy(prev, response.result, 'id'));
      if (response.result.length < firebase.pagination.pageSize) setIsAllFetched(true);
    }
    setIsFetchingData(false);
  };

  useEffect(() => {
    if (globalStore === null || globalStore.currentUser === null) return;
    handleFetchNotificationsCount();
    handleFetchNotificationsData();
  }, [globalStore?.currentUser]);

  useEventListener('scroll', () => {
    if (isAllFetched || isFetchingData || isFetchingCount) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const documentHeight = document.documentElement.scrollHeight;
    if (scrollTop + windowHeight >= documentHeight) handleFetchNotificationsData();
  });

  useEffect(() => {
    if (!!globalStore?.currentUser?.uid && !!globalStore?.notificationsCount) {
      globalStore.resetNotificationsCount();
      MarkAllHeaderNotificationsAsRead({ toUserId: globalStore?.currentUser?.uid });
    }
  }, [globalStore?.notificationsCount]);

  useEffect(() => {
    if (globalStore === null || globalStore.currentUser === null || isSubscribed || isFetchingData) return;
    setIsSubscribed(true);
    const unsuscribe = onSnapshot(query(collection(firebase.firestore, firebase.collections.notifications), where('toUser', '==', globalStore?.currentUser?.uid), orderBy('datetime', 'desc'), limit(10)), (snapshot) => {
      if (globalStore?.currentUser?.uid) MarkAllHeaderNotificationsAsRead({ toUserId: globalStore?.currentUser?.uid });
      if (data.length <= 0) {
        const newNotifs = snapshot.docs.map((item) => ({ ...item.data(), id: item.id }) as INotificationType);
        setData((prev) => unionBy(newNotifs, prev, 'id'));
        setTimeout(() => handleFetchNotificationsCount(true), 100);
      } else {
        const topItemId = data[0].id;
        const breakIndex = snapshot.docs.findIndex((item) => item.id === topItemId);
        const newNotifs = breakIndex <= 0 ? [] : snapshot.docs.slice(0, breakIndex).map((item) => ({ ...item.data(), id: item.id }) as INotificationType);
        setData((prev) => unionBy(newNotifs, prev, 'id'));
        setTimeout(() => handleFetchNotificationsCount(true), 100);
      }
    });

    return () => {
      unsuscribe();
      setIsSubscribed(false);
    };
  }, [globalStore?.currentUser?.uid, isFetchingData]);

  return (
    <AppPageLayout title="Notifications" countBadge={count} className="p-0" sectionLoader={isFetchingCount}>
      {!isFetchingData && data.length <= 0 ? (
        <EmptyList type="notifications" />
      ) : (
        <>
          {data.map((item, index) => (
            <React.Fragment key={item.id}>
              {index > 0 && <Separator className="opacity-50" />}
              <NotificationDialog data={item} handleMarkedAsRead={handleMarkedAsRead} />
            </React.Fragment>
          ))}
          {isFetchingData ? <Spinner container="fullWidth" color="secondary" size="md" /> : null}
        </>
      )}
    </AppPageLayout>
  );
};

export default NotificationsIndex;
