import { Separator } from '@/components/ui/separator';
import { date } from '@/utils/date.utils';
import React from 'react';

interface IProps {
  dateTime: string;
}

const ChatMessagesDateSeparator: React.FC<IProps> = ({ dateTime }) => {
  return (
    <div className="relative my-5 w-full">
      <Separator />
      <p className="absolute left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%] bg-card p-2 text-xs font-normal">{date.getRelativeDateLabel(dateTime)}</p>
    </div>
  );
};

export default ChatMessagesDateSeparator;
