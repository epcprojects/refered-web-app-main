'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IProfileWithFavorites } from '@/firebase/profile';
import { User } from 'firebase/auth';
import React, { useMemo } from 'react';
import ProfileCompanyInfo from './profile-company-info';
import ProfileFavoritesList from './profile-favorites-list';
import ProfileReferralsList from './profile-referrals-list';
import ProfileCompanySecondRow from './profile-second-row';

interface IProps {
  data: IProfileWithFavorites;
  loggedInUser?: User | null;
}

const tabs = [
  { label: 'Referral', value: 'referrals', component: ProfileReferralsList },
  { label: 'Favorites', value: 'favorites', component: ProfileFavoritesList },
];

const ProfileBody: React.FC<IProps> = ({ data, loggedInUser }) => {
  const isBusinessProfile = useMemo(() => Boolean(data.UserType === 'Business'), [data]);

  return (
    <div className="p-4">
      {isBusinessProfile && (
        <>
          <ProfileCompanyInfo data={data} />
          {loggedInUser?.email !== data.email && <ProfileCompanySecondRow data={data} classes="mb-4" />}
        </>
      )}
      <Tabs defaultValue={tabs[0].value} className="w-full">
        <TabsList className="grid h-10 w-full grid-cols-2">
          {tabs.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((item) => (
          <TabsContent key={item.value} value={item.value}>
            <item.component profileData={data} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ProfileBody;
