'use client';

import EmptyList from '@/components/common/empty-list';
import AppPageLayout from '@/components/layout/app-page-layout';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { firebase } from '@/firebase';
import { GetAllChatGroups, GetAllChatGroupsCount, IChatGroup } from '@/firebase/chat';
import { IProfile } from '@/firebase/profile';
import { useAppStore } from '@/hooks/use-app-store';
import { asyncGuard, unionBy } from '@/utils/lodash.utils';
import { collection, getDocs, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useEventListener } from 'usehooks-ts';
import ChatItem from './chat-item';

interface IProps {}

const ChatsIndex: React.FC<IProps> = () => {
  const globalStore = useAppStore('Global');

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isAllFetched, setIsAllFetched] = useState(false);
  const [count, setCount] = useState(0);
  const [data, setData] = useState<IChatGroup[]>([]);
  const [isFetchingCount, setIsFetchingCount] = useState(true);
  const [isFetchingData, setIsFetchingData] = useState(true);

  const handleFetchChatGroupsCount = async (isFollowUp?: boolean) => {
    if (!isFollowUp) setIsFetchingCount(true);
    const response = await asyncGuard(() => GetAllChatGroupsCount({ userId: globalStore?.currentUser?.uid || '' }));
    if (response.result !== null) setCount(response.result);
    if (!isFollowUp) setIsFetchingCount(false);
  };

  const handleFetchChatGroupsData = async () => {
    setIsFetchingData(true);
    const response = await asyncGuard(() => GetAllChatGroups({ userId: globalStore?.currentUser?.uid || '', lastItemId: data.length <= 0 ? undefined : data[data.length - 1].id }));
    if (response.error !== null || response.result === null) toast.error(response.error?.toString() || 'Something went wrong!');
    else {
      setData((prev) => unionBy(prev, response.result, 'id'));
      if (response.result.length < firebase.pagination.pageSize) setIsAllFetched(true);
    }
    setIsFetchingData(false);
  };

  useEffect(() => {
    if (globalStore === null || globalStore.currentUser === null) return;
    handleFetchChatGroupsCount();
    handleFetchChatGroupsData();
  }, [globalStore?.currentUser]);

  useEventListener('scroll', () => {
    if (isAllFetched || isFetchingData || isFetchingCount) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const documentHeight = document.documentElement.scrollHeight;
    if (scrollTop + windowHeight >= documentHeight) handleFetchChatGroupsData();
  });

  useEffect(() => {
    if (globalStore === null || globalStore.currentUser === null || isSubscribed || isFetchingData) return;
    setIsSubscribed(true);
    const unsuscribe = onSnapshot(query(collection(firebase.firestore, firebase.collections.chatGroups), where('participants', 'array-contains', globalStore.currentUser.uid), orderBy('modifiedat', 'desc'), limit(10)), async (snapshot) => {
      const profilesResponse = await asyncGuard(() => getDocs(collection(firebase.firestore, firebase.collections.profile)));
      if (profilesResponse.error !== null || profilesResponse.result === null) return;
      const profiles = profilesResponse.result.docs.map((item) => ({ ...item.data(), id: item.id })) as IProfile[];

      const newChats = snapshot.docs.map((item) => {
        const itemData = item.data() as IChatGroup;
        const toUserProfile = profiles.find((profile) => profile.UserId === itemData.to.userId) || null;
        const fromUserProfile = profiles.find((profile) => profile.UserId === itemData.from.senderId) || null;
        return { ...itemData, id: item.id, toUserProfile, fromUserProfile } as IChatGroup;
      });

      if (data.length <= 0) {
        setData((prev) => unionBy(newChats, prev, 'id'));
        setTimeout(() => handleFetchChatGroupsCount(true), 100);
      } else {
        const newChatIds = newChats.map((item) => item.id);
        const filteredPrevData = data.filter((item) => newChatIds.includes(item.id) === false);
        setData(unionBy(newChats, filteredPrevData, 'id'));
        setTimeout(() => handleFetchChatGroupsCount(true), 100);
      }
    });

    return () => {
      unsuscribe();
      setIsSubscribed(false);
    };
  }, [globalStore?.currentUser?.uid, isFetchingData]);

  return (
    <AppPageLayout title="Messages" countBadge={count} className="p-0" sectionLoader={isFetchingCount}>
      {!isFetchingData && data.length <= 0 ? (
        <EmptyList type="messages" />
      ) : (
        <>
          {data.map((item, index) => (
            <React.Fragment key={item.id}>
              {index > 0 && <Separator className="opacity-50" />}
              <ChatItem data={item} />
            </React.Fragment>
          ))}
          {isFetchingData ? <Spinner container="fullWidth" color="secondary" size="md" /> : null}
        </>
      )}
    </AppPageLayout>
  );
};

export default ChatsIndex;
