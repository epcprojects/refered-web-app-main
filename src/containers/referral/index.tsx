'use client';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { AppPages } from '@/constants/app-pages.constants';
import { useCreateReferral } from '@/utils/use-hooks.utils';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import React, { useEffect } from 'react';

interface IProps {}

const ReferralIndex: React.FC<IProps> = () => {
  const { router, handleCreateReferral, globalStore, isCreatingReferral, error } = useCreateReferral();
  const params = useParams<{ businessId: string; referredById: string }>();

  const handleGoToProfile = () => router.replace(AppPages.HOME);

  useEffect(() => {
    handleCreateReferral(params.businessId, params.referredById);
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
