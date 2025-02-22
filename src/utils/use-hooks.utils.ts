/* eslint-disable no-restricted-imports */
import { AppPages } from '@/constants/app-pages.constants';
import { CreateReferral } from '@/firebase/referral';
import { useAppStore } from '@/hooks/use-app-store';
import { Timestamp } from 'firebase/firestore'; // Adjust the import path
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { useCopyToClipboard, useCountdown, useDebounceValue, useEventListener } from 'usehooks-ts';
import { asyncGuard } from './lodash.utils';

const useCreateReferral = () => {
  const router = useRouter();
  const globalStore = useAppStore('Global');

  const [isCreatingReferral, setIsCreatingReferral] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateReferral = async (businessId: string, referredById: string, allowMeReferringMyself: boolean | undefined = false) => {
    if (!globalStore || !globalStore.currentUser || !globalStore.currentUserProfile) {
      return;
    }

    const currentUser = globalStore.currentUser;
    const currentUserProfile = globalStore.currentUserProfile;

    if (!allowMeReferringMyself && (businessId === currentUser.uid || referredById === currentUser.uid)) {
      toast.error('You cannot redeem your own referral!');
      setError('You cannot redeem your own referral!');
      return;
    }

    setIsCreatingReferral(true);
    const response = await asyncGuard(() =>
      CreateReferral({
        referredToUserId: currentUser.uid,
        referredByUserId: referredById,
        referredBusinessUserId: businessId,
        datetime: Timestamp.now(),
        isRedeemed: '0',
        referredToUserProfileData: currentUserProfile,
      }),
    );

    if (response.error !== null || response.result === null) {
      toast.error(response.error?.toString() || 'Something went wrong!');
      setError('Referral link is either invalid or broken!');
      setIsCreatingReferral(false);
    } else {
      if (response.result.isSuccess === false) {
        toast.error('Referral is already open with this business!');
        setError('Referral is already open with this business!');
        setIsCreatingReferral(false);
      } else {
        toast.success('Referral created successfully!');
        router.replace(AppPages.HOME);
      }
    }
  };

  return { router, globalStore, setIsCreatingReferral, isCreatingReferral, error, setError, handleCreateReferral };
};

export { useCopyToClipboard, useCountdown, useCreateReferral, useDebounceValue, useEventListener };
