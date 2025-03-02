'use client';

import Avatar from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AppPages } from '@/constants/app-pages.constants';
import { IFavorite } from '@/firebase/favorite';
import { IProfileWithFavorites } from '@/firebase/profile';
import { asyncGuard, initials } from '@/utils/lodash.utils';
import { useCreateReferral } from '@/utils/use-hooks.utils';
import Image from 'next/image';
import React, { useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { useCopyToClipboard } from 'usehooks-ts';
import ProfileListDialog from './profile-list-dialog';

interface IProps {
  data: IProfileWithFavorites;
  classes?: string;
}

//TODO: Refactor this to remove redundant code (Similar here => profile-header).
const ProfileCompanySecondRow: React.FC<IProps> = ({ data, classes = '' }) => {
  const { handleCreateReferral, globalStore, isCreatingReferral } = useCreateReferral();
  const [_, copy] = useCopyToClipboard();

  const connectButtonRef = useRef<HTMLButtonElement>(null);
  const authUserId = globalStore?.currentUserProfile?.UserId || '';
  const isBusinessProfile = useMemo(() => data.UserType === 'Business', [data]);
  // const isMyProfile = useMemo(() => Boolean(authUserId === data.UserId), [data, globalStore]);
  const referralUrl = useMemo(() => `${process.env.NEXT_PUBLIC_FRONTEND_URL}${isBusinessProfile ? `${AppPages.REFERRAL}/${data.UserId}/${authUserId}` : `${AppPages.PROFILE}/${data.UserId}`}`, [data, isBusinessProfile, globalStore]);

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

  const onUserClickFromList = async (user: IFavorite) => {
    const { UserId: referredById } = user || {}; //Using `ProfileId` here as `UserId` is inconsistent and showing the `BusinessId`
    const businessId = data.UserId;

    await handleCreateReferral(businessId, referredById);
  };

  const iReferBusinessToMyself = async () => {
    if (data.mutualFavourites?.length) return;

    const businessId = data.UserId;
    await handleCreateReferral(businessId, authUserId, true);
  };

  const handleShareProfile = async () => {
    await shareReferralLink(referralUrl + `?n=${data.FirstName}&btN=${data.BusinessTypeName}&bN=${data.BusinessName}/`); //NOTE: Adding / slash is important for Whatsapp to fetch url.
  };

  const Elements = {
    Refer: { left: <Image src="/images/msg-ico.svg" alt="Message icon" width={24} height={24} /> },
    Connect: { left: <Avatar src={data.ImageUrl} className="h-[24px] w-[24px] border-1 border-white bg-white" alt="Profile Picture" fallback={initials([data.FirstName, data.LastName].join(' ').trim()).slice(0, 2)} /> },
  };

  const Buttons = {
    Refer: <Button type="button" classes={{ container: 'w-full', label: 'not-sr-only' }} label="Refer to Friend" variant="secondary" onClick={() => handleShareProfile()} leftElement={Elements.Refer.left} />,
    Connect: <Button ref={connectButtonRef} type="button" isLoading={isCreatingReferral} classes={{ container: 'w-full', label: 'not-sr-only' }} label={'Connect with ' + data.FirstName || 'User'} variant="secondary" onClick={iReferBusinessToMyself} leftElement={Elements.Connect.left} />,
  };

  return (
    <div className={`flex gap-2 ${classes}`}>
      {Buttons.Refer}
      <ProfileListDialog data={data.mutualFavourites} triggerClass="w-full" trigger={Buttons.Connect} showDialog={true} onUserClick={onUserClickFromList} dialogLoading={isCreatingReferral} />
    </div>
  );
};

export default ProfileCompanySecondRow;
