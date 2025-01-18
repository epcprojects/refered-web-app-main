'use client';

import AuthPageLayout from '@/components/layout/auth-page-layout';
import { Button } from '@/components/ui/button';
import { AppPages } from '@/constants/app-pages.constants';
import { useAppStore } from '@/hooks/use-app-store';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

interface IProps {}

const VerificationSuccessIndex: React.FC<IProps> = () => {
  const router = useRouter();
  const globalStore = useAppStore('Global');

  const handleGoToProfile = () => router.replace(AppPages.HOME);

  useEffect(() => {
    if (globalStore?.isVerifiedRecently) globalStore?.resetIsVerifiedRecently();
  }, [globalStore?.isVerifiedRecently]);

  return (
    <AuthPageLayout coverImageSrc="/images/auth-cover-03.jpg">
      <div className="flex w-full items-center justify-center">
        <div className="flex w-full max-w-[32rem] flex-col items-center justify-center gap-2 px-8 py-20">
          <Image src="/images/thumbs-up.png" alt="Logo" width={100} height={100} />
          <h3 className="mt-2 max-w-[25rem] text-center text-2xl font-medium text-foreground">It's almost the time to get Refer'd</h3>
          <p className="mb-2 max-w-[25rem] text-center text-sm text-foreground">Your account has been verified successfully!</p>
          <Button type="button" classes={{ container: 'w-full mt-2.5' }} label="Go to Profile" variant="secondary" onClick={handleGoToProfile} />
        </div>
      </div>
    </AuthPageLayout>
  );
};

export default VerificationSuccessIndex;
