'use client';

import Avatar from '@/components/ui/avatar';
import { AppPages } from '@/constants/app-pages.constants';
import { IChatGroup } from '@/firebase/chat';
import { useAppStore } from '@/hooks/use-app-store';
import { cn } from '@/utils/cn.utils';
import { date } from '@/utils/date.utils';
import { initials } from '@/utils/lodash.utils';
import NextLink from 'next/link';
import React, { useMemo } from 'react';
import { RiImage2Line } from 'react-icons/ri';

interface IProps {
  data: IChatGroup;
}

const ChatItem: React.FC<IProps> = ({ data }) => {
  const globalStore = useAppStore('Global');

  const unreadMessagesCount = useMemo(() => (data.from.senderId === globalStore?.currentUser?.uid ? data.fromUserUnreadMessagesCount : data.toUserUnreadMessagesCount), [data, globalStore]);
  const dataCompiled = useMemo<{ img: string; name: string; businessName: string | undefined }>(() => {
    const currentUserId = globalStore?.currentUser?.uid;
    if (data.from.senderId === currentUserId) return { img: data.toUserProfile === null ? '' : data.toUserProfile.ImageUrl || '', name: data.toUserProfile === null ? data.to.userName : [data.toUserProfile?.FirstName, data.toUserProfile?.LastName].join(' ').trim(), businessName: data.toUserProfile?.BusinessName };
    else return { img: data.fromUserProfile === null ? data.from.senderImageUrl : data.fromUserProfile.ImageUrl || '', name: data.fromUserProfile === null ? data.from.senderName : [data.fromUserProfile?.FirstName, data.fromUserProfile?.LastName].join(' ').trim(), businessName: data.fromUserProfile?.BusinessName };
  }, [data, globalStore]);

  return (
    <NextLink href={`${AppPages.CHAT_MESSAGES}/${data.id}`} className={cn('flex cursor-pointer flex-col gap-0 px-4 py-3 transition-colors hover:bg-background/50', unreadMessagesCount > 0 ? 'bg-primary/15 hover:bg-primary/10' : '')}>
      <div className="flex flex-row items-start justify-between">
        <div className="flex flex-row gap-3">
          <Avatar src={dataCompiled.img} alt={dataCompiled.name} fallback={initials(dataCompiled.name).slice(0, 2)} />
          <div className="flex flex-1 flex-col">
            <h3 className="my-auto text-sm font-normal">{dataCompiled.name}</h3>
            <p className="text-xs font-normal text-muted-foreground">{dataCompiled.businessName}</p>
          </div>
        </div>
        <div className="flex flex-row items-end gap-1">
          <p className="text-xs font-normal text-muted-foreground">{date.formatDistanceToNow(date.fromUnixTime(data.modifiedat.seconds))}</p>
          {!!unreadMessagesCount ? <p className="text-muted-foreground">.</p> : null}
          {!!unreadMessagesCount ? <div className="flex h-4 w-max min-w-4 items-center justify-center rounded-full bg-primary px-[5px] text-center text-[9px] font-normal leading-none text-primary-foreground">{unreadMessagesCount >= 100 ? '99+' : unreadMessagesCount}</div> : null}
        </div>
      </div>
      {
        <div className={cn('ml-4 mt-3 rounded-md')}>
          {data.recentMessage === undefined ? (
            <p className={cn('line-clamp-2 text-sm italic text-muted-foreground opacity-70')}>Start conversation...</p>
          ) : data.recentMessage.type === 'text' ? (
            <p className={cn('line-clamp-2 text-sm text-muted-foreground')}>{data.recentMessage.text}</p>
          ) : (
            <div className="flex flex-row items-center gap-1 text-sm text-muted-foreground">
              <span>
                <RiImage2Line />
              </span>
              <span>Image</span>
            </div>
            // <div className="relative w-max overflow-hidden rounded-md">
            //   <Image src={data.recentMessage.attachmentURL} alt="recent message" width={150} height={150} />
            // </div>
          )}
        </div>
      }
    </NextLink>
  );
};

export default ChatItem;
