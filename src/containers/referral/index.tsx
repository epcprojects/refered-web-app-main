'use client';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { AppPages } from '@/constants/app-pages.constants';
import { CreateReferral } from '@/firebase/referral';
import { useAppStore } from '@/hooks/use-app-store';
import { asyncGuard } from '@/utils/lodash.utils';
import { Timestamp } from 'firebase/firestore';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface IProps {}

const ReferralIndex: React.FC<IProps> = () => {
  const router = useRouter();
  const globalStore = useAppStore('Global');
  const params = useParams<{ businessId: string; referredById: string }>();

  const [isCreatingReferral, setIsCreatingReferral] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoToProfile = () => router.replace(AppPages.HOME);
  const handleCreateReferral = async () => {
    if (globalStore === null || globalStore.currentUser === null || globalStore.currentUserProfile === null) return;

    const currentUser = globalStore.currentUser;
    const currentUserProfile = globalStore.currentUserProfile;

    if (params.businessId === currentUser.uid) {
      setError('You cannot redeem your own referral!');
      return;
    }

    if (params.referredById === currentUser.uid) {
      setError('You cannot redeem your own referral!');
      return;
    }

    setIsCreatingReferral(true);
    const response = await asyncGuard(() => CreateReferral({ referredToUserId: currentUser.uid, referredByUserId: params.referredById, referredBusinessUserId: params.businessId, datetime: Timestamp.now(), isRedeemed: '0', referredToUserProfileData: currentUserProfile }));
    if (response.error !== null || response.result === null) {
      toast.error(response.error?.toString() || 'Something went wrong!');
      setError('Referral link is either invalid or broken!');
      setIsCreatingReferral(false);
    } else {
      if (response.result.isSuccess === false) {
        setError('Referral is already open with this business!');
        setIsCreatingReferral(false);
      } else {
        toast.success('Referral created successfully!');
        router.replace(AppPages.HOME);
      }
    }
  };

  useEffect(() => {
    handleCreateReferral();
  }, [globalStore?.currentUser]);

  return (
    <div className="flex flex-col gap-4 px-2">
      {isCreatingReferral ? (
        <Spinner container="fullWidth" color="secondary" size="md" />
      ) : error !== null ? (
        <div className="my-28 flex flex-col items-center justify-center gap-4">
          <Image src="/images/empty-list.svg" alt="Empty List" width={50} height={50} />
          <p className="text-sm font-medium">{error}</p>
          <Button type="button" classes={{ container: 'w-max mt-2.5' }} label="Go to Profile" variant="secondary" onClick={handleGoToProfile} />
        </div>
      ) : null}
    </div>
  );
};

export default ReferralIndex;
