'use client';

import Avatar from '@/components/ui/avatar';
import { IChatMessage } from '@/firebase/chat';
import { useAppStore } from '@/hooks/use-app-store';
import { cn } from '@/utils/cn.utils';
import { date } from '@/utils/date.utils';
import { initials } from '@/utils/lodash.utils';
import Image from 'next/image';
import React, { useMemo } from 'react';

interface IProps {
  data: IChatMessage;
}

const ChatMessagesBubble: React.FC<IProps> = ({ data }) => {
  const globalStore = useAppStore('Global');
  const fromMe = useMemo(() => Boolean(data.from.senderId === globalStore?.currentUser?.uid), [data, globalStore?.currentUser?.uid]);

  return (
    <div className={cn('flex w-full flex-row items-start gap-2', fromMe ? 'justify-end' : 'justify-start')}>
      {fromMe ? null : <Avatar src={data.from.senderImageUrl} alt={data.from.senderName} fallback={initials(data.from.senderName).slice(0, 2)} />}
      <div className="flex flex-col gap-1">
        <div className={cn('overflow-hidden rounded-md border-1 p-1.5 pr-8 text-sm', fromMe ? 'rounded-tr-none border-primary bg-primary' : 'rounded-tl-none border-border/50 bg-background/60', data.type === 'image' && 'border-none p-0')}>{data.type === 'text' ? data.body.text : <Image src={data.body.attachmentURL} alt="chat attachment" width={250} height={250} />}</div>
        <p className={cn('text-xs font-normal text-muted-foreground', fromMe ? 'text-right' : 'text-left')}>{date.format(date.fromUnixTime(data.datetime.seconds), 'EEE hh:mm a')}</p>
      </div>
    </div>
  );
};

export default ChatMessagesBubble;
