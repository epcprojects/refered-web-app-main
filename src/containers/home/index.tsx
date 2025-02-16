'use client';

import EmptyList from '@/components/common/empty-list';
import ProfileBody from '@/containers/profile/profile-body';
import ProfileHeader from '@/containers/profile/profile-header';
import { IProfileWithFavorites } from '@/firebase/profile';
import { useAppStore } from '@/hooks/use-app-store';
import React from 'react';

interface IProps {}

const HomeIndex: React.FC<IProps> = ({}) => {
  const globalStore = useAppStore('Global');

  if (globalStore === null || globalStore.currentUser === null) return <EmptyList type="404" />;
  return (
    <div className="flex flex-col">
      <ProfileHeader data={globalStore.currentUserProfile as IProfileWithFavorites} />
      <ProfileBody data={globalStore.currentUserProfile as IProfileWithFavorites} loggedInUser={globalStore.currentUser} />
    </div>
  );
};

export default HomeIndex;
