'use client';

import Avatar from '@/components/ui/avatar';
import { AppPages } from '@/constants/app-pages.constants';
import { IChatGroup } from '@/firebase/chat';
import { useAppStore } from '@/hooks/use-app-store';
import { initials } from '@/utils/lodash.utils';
import { useRouter } from 'next/navigation';
import React, { useMemo } from 'react';
import { RiArrowLeftSLine } from 'react-icons/ri';

interface IProps {
  data: IChatGroup | null;
}

const ChatMessagesHeader: React.FC<IProps> = ({ data }) => {
  const globalStore = useAppStore('Global');
  const router = useRouter();

  const handleGoBack = () => router.push(AppPages.CHATS);

  const dataCompiled = useMemo<{ img: string; name: string; businessName: string | undefined }>(() => {
    const currentUserId = globalStore?.currentUser?.uid;
    if (data?.from.senderId === currentUserId) return { img: data?.toUserProfile === null ? '' : data?.toUserProfile.ImageUrl || '', name: data?.toUserProfile === null ? data.to.userName : [data?.toUserProfile?.FirstName, data?.toUserProfile?.LastName].join(' ').trim(), businessName: data?.toUserProfile?.BusinessName };
    else return { img: data?.fromUserProfile === null ? data.from.senderImageUrl : data?.fromUserProfile.ImageUrl || '', name: data?.fromUserProfile === null ? data.from.senderName : [data?.fromUserProfile?.FirstName, data?.fromUserProfile?.LastName].join(' ').trim(), businessName: data?.fromUserProfile?.BusinessName };
  }, [data, globalStore]);

  return (
    <div className="flex flex-row items-center gap-2 md:mt-4">
      <button onClick={handleGoBack} className="group cursor-pointer">
        <RiArrowLeftSLine size={20} className="transition-all group-hover:-translate-x-0.5" />
      </button>
      <div className="flex flex-row gap-3">
        <Avatar src={dataCompiled.img} alt={dataCompiled.name} fallback={initials(dataCompiled.name).slice(0, 2)} />
        <div className="flex w-full flex-1 flex-col">
          <h3 className="my-auto line-clamp-1 min-w-full max-w-[80%] text-sm font-normal">{dataCompiled.name}</h3>
          <p className="line-clamp-1 min-w-full max-w-[80%] text-xs font-normal text-muted-foreground">{dataCompiled.businessName}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatMessagesHeader;
