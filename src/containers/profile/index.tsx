'use client';

import EmptyList from '@/components/common/empty-list';
import { Spinner } from '@/components/ui/spinner';
import { GetProfileById, IProfileWithFavorites } from '@/firebase/profile';
import { useAppStore } from '@/hooks/use-app-store';
import { asyncGuard } from '@/utils/lodash.utils';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ProfileBody from './profile-body';
import ProfileHeader from './profile-header';

interface IProps {}

const ProfileIndex: React.FC<IProps> = () => {
  const globalStore = useAppStore('Global');
  const params = useParams<{ id: string }>();

  const [data, setData] = useState<IProfileWithFavorites | null>(null);
  const [isFetchingData, setIsFetchingData] = useState(true);

  const handleFetchData = async () => {
    if (globalStore === null || globalStore.currentUser === null) return;
    setIsFetchingData(true);
    const response = await asyncGuard(() => GetProfileById({ id: params.id, loggedInUserId: globalStore?.currentUser?.uid || '' }));
    if (response.error !== null || response.result === null) toast.error(response.error?.toString() || 'Something went wrong!');
    else setData(response.result);
    setIsFetchingData(false);
  };

  useEffect(() => {
    handleFetchData();
  }, [globalStore?.currentUser]);

  if (isFetchingData) return <Spinner container="fullWidth" color="secondary" size="md" />;
  else if (data === null) return <EmptyList type="404" />;
  return (
    <div className="flex flex-col">
      <ProfileHeader data={data} />
      <ProfileBody data={data} />
    </div>
  );
};

export default ProfileIndex;
