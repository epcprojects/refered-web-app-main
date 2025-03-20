'use client';

import { AppPages } from '@/constants/app-pages.constants';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useMemo } from 'react';
import SignupBusinessForm from './signup-business-form';
import SignupPersonalForm from './signup-personal-form';
import SignupSelectAccountTypeForm from './signup-select-account-type-form';

interface IProps {}

const SignupIndex: React.FC<IProps> = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleResetAccountType = () => router.push(AppPages.SIGNUP + (searchParams.get('callback') ? `?callback=${searchParams.get('callback')}` : ''));
  const handleSelectAccountType = (type: string) => router.push(`${AppPages.SIGNUP}?${searchParams.get('callback') ? `callback=${searchParams.get('callback')}` : ''}&accountType=${type}`);
  const accountType = useMemo(() => (searchParams.get('accountType') || null) as 'personal' | 'business' | null, [searchParams]);

  if (accountType === null) return <SignupSelectAccountTypeForm selectedAccountType={accountType} handleSelectAccountType={handleSelectAccountType} />;
  else if (accountType === 'business') return <SignupBusinessForm handleGoBack={handleResetAccountType} params={searchParams.get('callback') ? `?callback=${searchParams.get('callback')}` : ''} />;
  else if (accountType === 'personal') return <SignupPersonalForm handleGoBack={handleResetAccountType} params={searchParams.get('callback') ? `?callback=${searchParams.get('callback')}` : ''} />;
  else return null;
};

export default SignupIndex;
