'use client';

import Avatar from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AppPages } from '@/constants/app-pages.constants';
import { IProfileWithFavorites } from '@/firebase/profile';
import { uploadBlobToFirebase } from '@/firebase/upload';
import { useAppStore } from '@/hooks/use-app-store';
import { file } from '@/utils/file.utils';
import { asyncGuard, firebaseErrorMsg, initials } from '@/utils/lodash.utils';
import Image from 'next/image';
import React, { useMemo } from 'react';
import { toast } from 'sonner';
import { useCopyToClipboard } from 'usehooks-ts';
import ProfileListDialog from './profile-list-dialog';

interface IProps {
  data: IProfileWithFavorites;
  classes?: string;
}

//TODO: Refactor this to remove redundant code (Similar here => profile-header).
const ProfileCompanySecondRow: React.FC<IProps> = ({ data, classes = '' }) => {
  const globalStore = useAppStore('Global');
  const [_, copy] = useCopyToClipboard();

  const isBusinessProfile = useMemo(() => data.UserType === 'Business', [data]);
  const isMyProfile = useMemo(() => Boolean(globalStore?.currentUserProfile?.UserId === data.UserId), [data, globalStore]);
  const referralUrl = useMemo(() => `${process.env.NEXT_PUBLIC_FRONTEND_URL}${isBusinessProfile ? `${AppPages.REFERRAL}/${data.UserId}/${globalStore?.currentUserProfile?.UserId}` : `${AppPages.PROFILE}/${data.UserId}`}`, [data, isBusinessProfile, globalStore]);

  const shareReferralLink = async (referralUrl: string) => {
    if (navigator.share) {
      const response = await asyncGuard(() => navigator.share({ title: 'Referral Link', text: 'Share this referral link!', url: referralUrl }));
      if (!response.error) {
        const copied = await asyncGuard(() => copy(referralUrl));
        if (copied.result) toast.success('Referral link copied!');
      }
    } else {
      const copied = await asyncGuard(() => copy(referralUrl));
      if (copied.result) toast.success('Referral link copied!');
    }
  };

  const handleShareProfile = async () => {
    if (typeof window === 'undefined') return;

    if (isMyProfile) {
      await shareReferralLink(referralUrl);
      return;
    }

    const userId = data.UserId;
    const canvas = await file.generateShareableCard(data);
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const { result: imageUrl, error } = await asyncGuard(() => uploadBlobToFirebase({ blob: blob, userId, ext: 'webp', type: 'public' }));

      if (error || !imageUrl) throw new Error(firebaseErrorMsg(error));

      await shareReferralLink(referralUrl + `?n=${data.FirstName}&btN=${data.BusinessTypeName}&bN=${data.BusinessName}/`); //NOTE: Adding / slash is important for Whatsapp to fetch url.
    }, 'image/webp');
  };

  return (
    <div className={`flex gap-2 ${classes}`}>
      <Button type="button" classes={{ container: 'w-full' }} label="Refer to Friend" variant="secondary" onClick={() => handleShareProfile()} leftElement={<Image src="/images/msg-ico.svg" alt="Message icon" width={24} height={24} />} />
      <ProfileListDialog data={data.mutualFavourites} triggerClass="w-full" trigger={<Button type="button" classes={{ container: 'w-full' }} label={'Connect with ' + data.FirstName || 'User'} variant="secondary" leftElement={<Avatar src={data.ImageUrl} className="h-[24px] w-[24px] border-1 border-white bg-white" alt="Profile Picture" fallback={initials([data.FirstName, data.LastName].join(' ').trim()).slice(0, 2)} />} />} />
    </div>
  );
};

export default ProfileCompanySecondRow;
