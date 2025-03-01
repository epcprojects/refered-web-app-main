'use client';

import EmptyList from '@/components/common/empty-list';
import Avatar from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { AppPages } from '@/constants/app-pages.constants';
import { firebase } from '@/firebase';
import { GetAllFavoritesByUserId, IFavorite } from '@/firebase/favorite';
import { IProfile } from '@/firebase/profile';
import { asyncGuard, initials, unionBy } from '@/utils/lodash.utils';
import { useEventListener } from '@/utils/use-hooks.utils';
import NextLink from 'next/link';
import React, { useEffect, useState } from 'react';
import { RiHeart2Fill, RiMapPin2Line, RiNewsLine } from 'react-icons/ri';
import { toast } from 'sonner';

interface IProps {
  profileData: IProfile;
}

const ProfileFavoritesList: React.FC<IProps> = ({ profileData }) => {
  const [isAllFetched, setIsAllFetched] = useState(false);
  const [data, setData] = useState<IFavorite[]>([]);
  const [isFetchingData, setIsFetchingData] = useState(true);

  const handleFetchFavoritesData = async () => {
    setIsFetchingData(true);
    const response = await asyncGuard(() => GetAllFavoritesByUserId({ userId: profileData.UserId, lastItemId: data.length <= 0 ? undefined : data[data.length - 1].id }));
    if (response.error !== null || response.result === null) toast.error(response.error?.toString() || 'Something went wrong!');
    else {
      setData((prev) => unionBy(prev, response.result, 'id'));
      if (response.result.length < firebase.pagination.pageSize) setIsAllFetched(true);
    }
    setIsFetchingData(false);
  };

  useEffect(() => {
    handleFetchFavoritesData();
  }, []);

  useEventListener('scroll', () => {
    if (isAllFetched || isFetchingData) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const documentHeight = document.documentElement.scrollHeight;
    if (scrollTop + windowHeight >= documentHeight) handleFetchFavoritesData();
  });

  if (!isFetchingData && data.length <= 0) return <EmptyList type="favorites" />;
  return (
    <>
      {data.map((item, index) => (
        <React.Fragment key={item.id}>
          {index > 0 && <Separator className="opacity-50" />}
          <NextLink href={`${AppPages.PROFILE}/${item.UserId}`} className="flex cursor-pointer flex-row items-center gap-3 rounded-md p-2 py-2 transition-colors hover:bg-background/80">
            <Avatar src={item.ImageUrl} alt="Profile Picture" fallback={initials([item.FirstName, item.LastName].join(' ').trim()).slice(0, 2)} />
            <div className="flex max-w-full flex-1 flex-col overflow-hidden">
              <h3 className="my-auto w-[97%] overflow-hidden text-ellipsis whitespace-nowrap text-sm font-normal">{item.UserType === 'Business' ? item.BusinessName?.trim() : [item.FirstName, item.LastName].join(' ').trim()}</h3>
              {item?.City && item?.State && (
                <div className="mb-1 mt-[5px] flex gap-1 text-muted-foreground">
                  <RiMapPin2Line size={15} />
                  <p className="my-auto w-[97%] space-x-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-normal text-muted-foreground">
                    <span>{item.City + ', ' + item.State}</span>
                  </p>
                </div>
              )}
              {item.UserType === 'Business' && (item?.BusinessTypeName || item?.FirstName || item?.LastName) && (
                <div className="!ml-0 flex gap-1 text-muted-foreground">
                  <RiNewsLine size={15} />
                  <p className="my-auto w-[97%] space-x-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-normal text-muted-foreground">
                    <span>{item?.BusinessTypeName}</span>
                    <span className="mt-1">•</span>
                    <span>{[item?.FirstName, item?.LastName].join(' ').trim()}</span>
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-shrink-0 flex-col items-end gap-0.5">
              <div className="rounded-full p-1">
                <RiHeart2Fill size={20} />
              </div>
            </div>
          </NextLink>
        </React.Fragment>
      ))}
      {isFetchingData ? <Spinner container="fullWidth" color="secondary" size="md" /> : null}
    </>
  );
};

export default ProfileFavoritesList;
