'use client';

import Avatar from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { INotificationType, MarkNotificationAsRead } from '@/firebase/notifications';
import { cn } from '@/utils/cn.utils';
import { date } from '@/utils/date.utils';
import { initials } from '@/utils/lodash.utils';
import React, { useEffect } from 'react';

interface IProps {
  data: INotificationType;
  handleMarkedAsRead: (id: string) => void;
}

const NotificationDialog: React.FC<IProps> = ({ data, handleMarkedAsRead }) => (
  <Dialog>
    <DialogTrigger className="w-full text-start">
      <Notification data={data} handleMarkedAsRead={handleMarkedAsRead} />
    </DialogTrigger>
    <DialogContent className="max-w-[90%] p-0.5 md:w-[28rem]">
      <Notification data={data} handleMarkedAsRead={handleMarkedAsRead} showEntireMessage />
    </DialogContent>
  </Dialog>
);

export default NotificationDialog;

const Notification: React.FC<IProps & { showEntireMessage?: boolean }> = ({ data, handleMarkedAsRead, showEntireMessage }) => {
  useEffect(() => {
    if (data.isRead === '0' && showEntireMessage) {
      handleMarkedAsRead(data.id);
      MarkNotificationAsRead({ id: data.id });
    }
  }, []);

  return (
    <div className={cn('flex max-w-full cursor-pointer flex-col gap-0 overflow-hidden p-4 transition-colors hover:bg-background/50', data.isRead === '0' && !showEntireMessage && 'bg-primary/15 hover:bg-primary/10')}>
      <h3 className="max-w-[92.5%] break-words text-sm font-medium">{data.title}</h3>
      <p className="mt-[1px] text-xs text-muted-foreground/80">{date.format(date.fromUnixTime(data.datetime.seconds), 'dd MMMM yyyy, hh:mm a')}</p>
      <p className={cn('mb-4 mt-3.5 break-words text-sm text-muted-foreground', !showEntireMessage && 'line-clamp-3')}>{data.description}</p>
      <div className="flex max-w-full flex-row items-center gap-1.5 overflow-hidden">
        <Avatar src={data.fromUserProfile?.ImageUrl} alt={[data.fromUserProfile?.FirstName, data.fromUserProfile?.LastName].join(' ').trim()} fallback={initials([data.fromUserProfile?.FirstName, data.fromUserProfile?.LastName].join(' ').trim()).slice(0, 2)} className="!h-4.5 !w-4.5" fallbackClassName="text-[8px]" />
        <p className="w-[90%] break-words text-xs text-muted-foreground">from {[data.fromUserProfile?.FirstName, data.fromUserProfile?.LastName].join(' ').trim() || 'User'}</p>
      </div>
    </div>
  );
};
