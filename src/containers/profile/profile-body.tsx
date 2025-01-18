'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IProfileWithFavorites } from '@/firebase/profile';
import React, { useMemo } from 'react';
import ProfileCompanyInfo from './profile-company-info';
import ProfileFavoritesList from './profile-favorites-list';
import ProfileReferralsList from './profile-referrals-list';

interface IProps {
  data: IProfileWithFavorites;
}

const tabs = [
  { label: 'Referral', value: 'referrals', component: ProfileReferralsList },
  { label: 'Favorites', value: 'favorites', component: ProfileFavoritesList },
];

const ProfileBody: React.FC<IProps> = ({ data }) => {
  const isBusinessProfile = useMemo(() => Boolean(data.UserType === 'Business'), [data]);

  return (
    <div className="p-4">
      {isBusinessProfile ? <ProfileCompanyInfo data={data} /> : null}
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
