'use client';

import { Spinner } from '@/components/ui/spinner';
import { IProfileWithFavorites } from '@/firebase/profile';
import { useAppStore } from '@/hooks/use-app-store';
import React, { useEffect, useState } from 'react';
import ProfileEditForm from './profile-edit-form';

interface IProps {}

const ProfileEditIndex: React.FC<IProps> = () => {
  const globalStore = useAppStore('Global');

  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (isFetching && globalStore?.currentUserProfile) setIsFetching(false);
  }, [globalStore]);

  if (isFetching) return <Spinner container="fullWidth" color="secondary" size="md" />;
  return <ProfileEditForm data={globalStore?.currentUserProfile as IProfileWithFavorites} />;
};

export default ProfileEditIndex;
