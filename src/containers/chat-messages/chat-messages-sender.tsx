'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { IChatMessage, SendChatMessage } from '@/firebase/chat';
import { UploadFile } from '@/firebase/upload';
import { useAppStore } from '@/hooks/use-app-store';
import { cn } from '@/utils/cn.utils';
import { file } from '@/utils/file.utils';
import { asyncGuard } from '@/utils/lodash.utils';
import { scrollToBottom } from '@/utils/misc.utils';
import { Timestamp } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { RiImageLine, RiSendPlaneFill } from 'react-icons/ri';
import { toast } from 'sonner';

interface IProps {
  groupId: string;
  toFcmTokens: string[];
  toUserId: string;
  className?: string;
}

const maxSizeInMBs = 3;
const allowedFormats = file.allowedImageFormats;

const ChatMessagesSender: React.FC<IProps> = ({ groupId, toFcmTokens, toUserId, className }) => {
  const globalStore = useAppStore('Global');

  const textInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState<'text' | 'image' | null>(null);
  const [message, setMessage] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  const handleOpenImageSelector = () => {
    if (!!fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };
  const handleSelectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files === null) return;
    else if (!file.isMIMETypeAllowed(files[0].type, allowedFormats)) toast.error(`File type not allowed! (${allowedFormats.join(', ')}) format images should be uploaded only`);
    else if (files[0].size > file.ConvertMBstoBytes(maxSizeInMBs)) toast.error(`Exceeds max file size: ${maxSizeInMBs}MB`);
    else setSelectedImageFile(files[0]);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onSubmit();
      return null;
    }
  };
  const onSubmit = async () => {
    if (!!message === false && selectedImageFile === null) return;
    if (!!globalStore?.currentUser === false || !!globalStore?.currentUserProfile === false) {
      toast.error('Something went wrong!');
      return;
    }

    setIsSubmitting(selectedImageFile === null ? 'text' : 'image');

    let imageUrl: string | null = null;
    if (selectedImageFile !== null) {
      const uploadImageResponse = await asyncGuard(() => UploadFile({ type: 'chat', file: selectedImageFile }));
      if (uploadImageResponse.error !== null || uploadImageResponse.result === null) {
        toast.error(uploadImageResponse.error?.toString() || 'Something went wrong!');
        setIsSubmitting(null);
        return;
      } else imageUrl = uploadImageResponse.result;
    }

    const compiled: Omit<IChatMessage, 'id'> = { groupId, type: imageUrl === null ? 'text' : 'image', body: imageUrl === null ? { type: 'text', text: message } : { type: 'image', attachmentURL: imageUrl }, datetime: Timestamp.now(), from: { senderId: globalStore.currentUserProfile.UserId, senderImageUrl: globalStore.currentUserProfile.ImageUrl || '', senderName: [globalStore.currentUserProfile.FirstName, globalStore.currentUserProfile.LastName].join(' ').trim() } };
    const response = await asyncGuard(() => SendChatMessage({ ...compiled, toFcmTokens, toUserId }));
    if (response.error !== null || response.result === null) toast.error(response.error?.toString() || 'Something went wrong!');
    else {
      setMessage('');
      setSelectedImageFile(null);
    }

    setIsSubmitting(null);
    setTimeout(() => textInputRef.current?.focus(), 100);
  };

  useEffect(() => {
    scrollToBottom({ behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (selectedImageFile !== null) onSubmit();
  }, [selectedImageFile]);

  useEffect(() => {
    if (textInputRef === null) return;
    textInputRef.current?.focus();
  }, [textInputRef]);

  return (
    <div className={cn('flex flex-row items-center gap-1.5 border-t-1 border-border bg-[#F9F9F9] p-2', className)}>
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleSelectImage} max={file.ConvertMBstoBytes(maxSizeInMBs)} />
      <Button variant="border" size="sm" classes={{ container: 'bg-card h-9 w-9 flex-shrink-0 text-foreground' }} onClick={handleOpenImageSelector} disabled={isSubmitting !== null}>
        {isSubmitting === 'image' ? <Spinner /> : <RiImageLine className="scale-125" />}
      </Button>
      <Input ref={textInputRef} placeholder="Message" value={message} onChange={(e) => setMessage(e.currentTarget.value)} containerClassName="h-9 resize-none border-1 border-border bg-card shadow-none" disabled={isSubmitting !== null} onKeyDown={handleKeyDown} />
      <Button variant="default" size="sm" classes={{ container: 'h-9 w-9 shadow-none flex-shrink-0 ' }} onClick={onSubmit} disabled={isSubmitting !== null}>
        {isSubmitting === 'text' ? <Spinner /> : <RiSendPlaneFill className="scale-125" />}
      </Button>
    </div>
  );
};

export default ChatMessagesSender;
