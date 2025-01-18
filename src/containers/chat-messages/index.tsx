'use client';

import EmptyList from '@/components/common/empty-list';
import AppPageLayout from '@/components/layout/app-page-layout';
import { Spinner } from '@/components/ui/spinner';
import { firebase } from '@/firebase';
import { GetChatGroupById, GetChatMessagesByGroupId, IChatGroup, IChatMessage, MarkRecentMessageForGroupAsRead } from '@/firebase/chat';
import { useAppStore } from '@/hooks/use-app-store';
import { date } from '@/utils/date.utils';
import { asyncGuard, reverse, unionBy } from '@/utils/lodash.utils';
import { scrollToBottom } from '@/utils/misc.utils';
import { useEventListener } from '@/utils/use-hooks.utils';
import { getAllDesktopPlatforms } from '@/utils/user-info.utils';
import { collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import ChatMessagesBubble from './chat-messages-bubble';
import ChatMessagesDateSeparator from './chat-messages-date-separator';
import ChatMessagesHeader from './chat-messages-header';
import ChatMessagesSender from './chat-messages-sender';

interface IProps {}

const ChatMessagesIndex: React.FC<IProps> = () => {
  const globalStore = useAppStore('Global');
  const params = useParams<{ id: string }>();

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isAllFetched, setIsAllFetched] = useState(false);
  const [chatGroupData, setChatGroupData] = useState<IChatGroup | null>(null);
  const [data, setData] = useState<IChatMessage[]>([]);
  const [isFetchingChatGroup, setIsFetchingChatGroup] = useState(true);
  const [isFetchingData, setIsFetchingData] = useState(true);

  const toUserId = useMemo(() => (globalStore?.currentUser?.uid === chatGroupData?.fromUserProfile?.id ? chatGroupData?.toUserProfile?.id || '' : chatGroupData?.fromUserProfile?.id || ''), [chatGroupData, globalStore?.currentUser]);
  const toFCMtokens = useMemo(() => (globalStore?.currentUser?.uid === chatGroupData?.fromUserProfile?.id && !!chatGroupData?.fromUserProfile?.FCMToken ? chatGroupData?.toUserProfile?.FCMToken || [] : chatGroupData?.fromUserProfile?.FCMToken || []), [chatGroupData, globalStore?.currentUser]);

  const handleMarkRecentMessagesAsRead = async () => {
    if (globalStore?.currentUser?.uid) MarkRecentMessageForGroupAsRead({ groupId: params.id, userId: globalStore?.currentUser?.uid });
  };

  const handleFetchChatGroupData = async () => {
    setIsFetchingChatGroup(true);
    const response = await asyncGuard(() => GetChatGroupById({ groupId: params.id }));
    if (response.error !== null || response.result === null) toast.error(response.error?.toString() || 'Something went wrong!');
    else {
      const val = response.result;
      setChatGroupData(response.result);
    }
    setIsFetchingChatGroup(false);
  };

  const handleFetchChatMessagesData = async () => {
    setIsFetchingData(true);
    const response = await asyncGuard(() => GetChatMessagesByGroupId({ groupId: params.id, lastItemId: data.length <= 0 ? undefined : data[0].id }));
    if (response.error !== null || response.result === null) toast.error(response.error?.toString() || 'Something went wrong!');
    else {
      reverse(response.result || []);
      setData((prev) => unionBy(response.result, prev, 'id'));
      if (response.result.length < firebase.pagination.pageSize) setIsAllFetched(true);
    }
    setIsFetchingData(false);
  };

  const handleIsNearBottom = () => {
    // Get the current scroll position, total scrollable height, and viewport height
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const totalHeight = document.documentElement.scrollHeight;
    // Check if the user is near the bottom (e.g., within 100px)
    return totalHeight - (scrollPosition + viewportHeight) <= 100;
  };

  useEffect(() => {
    handleFetchChatGroupData();
    handleFetchChatMessagesData();
  }, []);

  useEffect(() => {
    handleMarkRecentMessagesAsRead();
  }, [globalStore?.currentUser?.uid]);

  useEventListener('scroll', () => {
    if (isAllFetched || isFetchingData || isFetchingChatGroup) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (scrollTop <= 0) {
      const prevScrollHeight = document.documentElement.scrollHeight;
      handleFetchChatMessagesData().then(() => {
        const newScrollHeight = document.documentElement.scrollHeight; // Calculate the new scroll position after data is appended
        const scrollAdjustment = newScrollHeight - prevScrollHeight;
        window.scrollTo(0, scrollAdjustment - 140); // Adjust scroll position to maintain the user's visual position
      });
    }
  });

  useEffect(() => {
    if (globalStore === null || globalStore.currentUser === null || isSubscribed || isFetchingData) return;
    setIsSubscribed(true);
    const unsuscribe = onSnapshot(query(collection(firebase.firestore, firebase.collections.chats), where('groupId', '==', params.id), orderBy('datetime', 'desc'), limit(10)), (snapshot) => {
      MarkRecentMessageForGroupAsRead({ groupId: params.id, userId: globalStore?.currentUser?.uid || '' });
      setData((prev) => unionBy(prev, snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as IChatMessage[], 'id'));
      if (handleIsNearBottom()) setTimeout(() => scrollToBottom(), 10);
    });

    return () => {
      setIsSubscribed(false);
      unsuscribe();
    };
  }, [globalStore?.currentUser?.uid, isFetchingData]);

  return (
    <AppPageLayout className="p-0" customHeader={<ChatMessagesHeader data={chatGroupData} />} sectionLoader={isFetchingChatGroup}>
      <div className="mb-14 flex h-full flex-1 flex-col gap-3 p-4 py-3">
        {!isFetchingData && data.length <= 0 ? (
          <EmptyList type="messages" />
        ) : (
          <>
            {isFetchingData ? <Spinner container="fullWidth" color="secondary" size="md" /> : null}
            {data.map((message, index) => (
              <React.Fragment key={message.id}>
                {index > 0 && !date.isSameDay(date.fromUnixTime(message.datetime.seconds), date.fromUnixTime(data[index - 1].datetime.seconds)) ? <ChatMessagesDateSeparator dateTime={date.fromUnixTime(message.datetime.seconds).toDateString()} /> : null}
                <ChatMessagesBubble data={message} />
              </React.Fragment>
            ))}
          </>
        )}
      </div>
      {chatGroupData === null || chatGroupData.toUserProfile === null || chatGroupData.fromUserProfile === null ? null : <ChatMessagesSender groupId={params.id} toFcmTokens={(toFCMtokens || []).filter((item) => getAllDesktopPlatforms().includes(item.platform)).map((item) => item.token)} toUserId={toUserId} className="fixed bottom-14 w-full md:bottom-2.5 md:max-w-[40rem] lg:w-[calc(100%-33.1rem)] lg:max-w-[32rem]" />}
    </AppPageLayout>
  );
};

export default ChatMessagesIndex;
