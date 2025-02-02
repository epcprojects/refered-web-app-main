'use client';

import Avatar from '@/components/ui/avatar';
import { cn } from '@/utils/cn.utils';
import { file } from '@/utils/file.utils';
import { initials } from '@/utils/lodash.utils';
import React, { useRef, useState } from 'react';
import { RiCameraFill } from 'react-icons/ri';
import { toast } from 'sonner';

interface IProps {
  profileName: string;
  profilePicUrl: string | undefined;
  setSelectedProfilePic: (val: File | null) => void;
}

const maxSizeInMBs = 3;
const allowedFormats = file.allowedImageFormats;

const UpdateProfileAvatar: React.FC<IProps> = ({ profileName, profilePicUrl, setSelectedProfilePic }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedProfilePicUrl, setSelectedProfilePicUrl] = useState<string | null>(null);

  const handleOpenImageSelector = () => fileInputRef.current && fileInputRef.current.click();
  const handleSelectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files === null) return;
    else if (!file.isMIMETypeAllowed(files[0].type, allowedFormats)) toast.error(`File type not allowed! (${allowedFormats.join(', ')}) format images should be uploaded only`);
    else if (files[0].size > file.ConvertMBstoBytes(maxSizeInMBs)) toast.error(`Exceeds max file size: ${maxSizeInMBs}MB`);
    else {
      setSelectedProfilePic(files[0]);
      setSelectedProfilePicUrl(URL.createObjectURL(files[0]));
    }
  };

  return (
    <div className="relative mb-10 space-y-3 px-5 py-4 pb-14">
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleSelectImage} max={file.ConvertMBstoBytes(maxSizeInMBs)} accept={allowedFormats.map((item) => `.${item}`.toLowerCase()).toString()} />
      <div className={cn('absolute -bottom-[45%] left-[50%] translate-x-[-50%]')}>
        <Avatar src={!!selectedProfilePicUrl ? selectedProfilePicUrl : profilePicUrl} alt={profileName} fallback={initials(profileName).slice(0, 2)} fallbackClassName="text-xl font-semibold" className="!h-24 !w-24 border-2 border-card" />
        <button type="button" onClick={handleOpenImageSelector} className="absolute bottom-0 right-0 flex h-[2.125rem] w-[2.125rem] cursor-pointer items-center justify-center rounded-full border-[3px] border-card bg-secondary text-primary">
          <RiCameraFill size={17} />
        </button>
      </div>
    </div>
  );
};

export default UpdateProfileAvatar;
