'use client';

import EmptyList from '@/components/common/empty-list';
import AppPageLayout from '@/components/layout/app-page-layout';
import Avatar from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { AppPages } from '@/constants/app-pages.constants';
import { firebase } from '@/firebase';
import { GetProfilesForSearch, IProfile, IProfileWithFavorites } from '@/firebase/profile';
import { useAppStore } from '@/hooks/use-app-store';
import { asyncGuard, debounce, initials, unionBy } from '@/utils/lodash.utils';
import { zodResolver } from '@hookform/resolvers/zod';
import NextLink from 'next/link';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { RiHeart2Fill, RiMapPin2Line, RiNewsLine } from 'react-icons/ri';
import { toast } from 'sonner';
import { useEventListener } from 'usehooks-ts';
import { z } from 'zod';
import { MutualFavourites } from '../profile/profile-referrals-list';
import { SearchHeader } from './search-header';

interface IProps {}

export type filterFormSchemaType = z.infer<typeof filterFormSchema>;
export const filterFormSchema = z.object({
  states: z.string().optional(),
  cities: z.string().optional(),
});

const SearchIndex: React.FC<IProps> = () => {
  const globalStore = useAppStore('Global');

  const form = useForm<filterFormSchemaType>({ resolver: zodResolver(filterFormSchema) });
  const city = form.watch('cities');
  const state = form.watch('states');

  const [searchTerm, setSearchTerm] = useState('');
  const [isAllFetched, setIsAllFetched] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [isFetchingCompleted, setIsFetchingCompleted] = useState(false);
  const [data, setData] = useState<{ users: IProfileWithFavorites[]; businesses: IProfileWithFavorites[] }>({ users: [], businesses: [] });
  const [businessesData, setBusinessesData] = useState<IProfileWithFavorites[]>([]);
  const [usersData, setUsersData] = useState<IProfileWithFavorites[]>([]);
  const [showMore, setShowMore] = useState<'businesses' | 'users' | null>(null);

  const handleSetShowMore = (val: 'businesses' | 'users' | null) => {
    if (val === null) setSearchTerm('');
    handleFetchData(val === null ? '' : searchTerm, true, val === null ? true : false, val);
    setShowMore(val);
    setBusinessesData([]);
    setUsersData([]);
    setIsAllFetched(false);
  };

  const handleFetchData = async (query: string = '', isNewQuery: boolean = true, isGoingBack: boolean = false, isForcefullyShowMore?: typeof showMore) => {
    console.log('Fetching data', query, globalStore?.currentUser);
    if (globalStore === null || globalStore.currentUser === null) return;
    const targetShowMore = isForcefullyShowMore === undefined ? showMore : isForcefullyShowMore;
    setIsFetchingData(true);
    setIsFetchingCompleted(false);
    const currentUser = globalStore.currentUser;

    const response = await asyncGuard(() => GetProfilesForSearch({ loggedInUserId: currentUser.uid, lastItemId: isNewQuery || targetShowMore === null || isGoingBack ? undefined : targetShowMore === 'businesses' ? (data.businesses.length <= 0 ? undefined : data.businesses[data.businesses.length - 1].id) : data.users.length <= 0 ? undefined : data.users[data.users.length - 1].id, searchTerm: query, ...(city ? { city } : {}), ...(state ? { state } : {}), targetType: targetShowMore === null ? undefined : targetShowMore === 'businesses' ? 'Business' : 'Normal' }));
    console.log('Response', response)
    if (response.error !== null || response.result === null) toast.error(response.error?.toString() || 'Something went wrong!');
    else {
      if (targetShowMore === null || isGoingBack) {
        setBusinessesData(response.result.businesses);
        setUsersData(response.result.users);
        setData(response.result);
      } else if (targetShowMore === 'businesses') {
        const businesses = isNewQuery ? response.result?.businesses || [] : unionBy(businessesData, response.result?.businesses, 'id');
        setBusinessesData(businesses);
        setUsersData([]);
        setData((prev) => ({ users: [], businesses: businesses }));
        if (response.result.businesses.length < firebase.pagination.pageSize) setIsAllFetched(true);
      } else if (targetShowMore === 'users') {
        const users = isNewQuery ? response.result?.users || [] : unionBy(usersData, response.result?.users, 'id');
        setBusinessesData([]);
        setUsersData([]);
        setData((prev) => ({ users: users, businesses: [] }));
        if (response.result.users.length < firebase.pagination.pageSize) setIsAllFetched(true);
      }
    }
    setIsFetchingData(false);
  };

  const handleQueryData = debounce(async (query: string) => {
    handleFetchData(query);
    setBusinessesData([]);
    setUsersData([]);
    setIsAllFetched(false);
  }, 500);

  useEffect(() => {
    handleQueryData(searchTerm);
  }, [searchTerm, city, state]);

  useEffect(() => {
    setBusinessesData(data.businesses);
    setUsersData(data.users);
  }, [data]);

  useEffect(() => {
    console.log('Fetching data');
    handleFetchData();
  }, [globalStore?.currentUser]);

  useEffect(() => {
    console.log('This useEffect is running');
    
  }, []);


  useEventListener('scroll', () => {
    if (isAllFetched || isFetchingData || showMore === null) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const documentHeight = document.documentElement.scrollHeight;
    if (scrollTop + windowHeight >= documentHeight) handleFetchData(searchTerm, false);
  });

  useEffect(() => {
    setTimeout(() => {
      if (isFetchingData === false && isFetchingCompleted === false) setIsFetchingCompleted(true);
    }, 500);
  }, [isFetchingData]);

  const handleToggleSearchFilter = () => {
    globalStore?.setIsSearchFilter(!globalStore.isSearchFilter);
  };

  return (
    <AppPageLayout className="flex flex-col gap-4 px-2" customHeaderClasses={'h-max'} customHeader={<SearchHeader form={form} setShowSearchFilter={handleToggleSearchFilter} showSearchFilter={globalStore?.isSearchFilter} showBackButton={showMore !== null} searchTerm={searchTerm} handleGoBack={() => handleSetShowMore(null)} setSearchTerm={setSearchTerm} />}>
      {(!isFetchingData && isFetchingCompleted && showMore === null && businessesData.length <= 0 && usersData.length <= 0) || (!isFetchingData && isFetchingCompleted && showMore === 'businesses' && businessesData.length <= 0) || (!isFetchingData && isFetchingCompleted && showMore === 'users' && usersData.length <= 0) ? (
        <EmptyList type="noDataFound" />
      ) : !isFetchingData && isFetchingCompleted ? (
        <div className={globalStore?.isSearchFilter ? 'mt-12' : ''}>
          {[
            { title: 'Business', seeMore: 'businesses' as const, data: businessesData, hide: showMore === 'users' },
            { title: 'Users', seeMore: 'users' as const, data: usersData, hide: showMore === 'businesses' },
          ].map((group, index) => {
            if (group.hide || group.data.length <= 0) return null;
            return (
              <div key={index} className="flex w-full flex-col">
                <h3 className="mb-1 px-2 text-lg font-semibold">{group.title}</h3>
                {(showMore === null ? group.data.slice(0, 5) : group.data).map((item) => (
                  <NextLink href={`${AppPages.PROFILE}/${item.UserId}`} key={item.id} className="flex w-full cursor-pointer flex-row items-center justify-between rounded-md p-2 transition-colors hover:bg-background/80">
                    <div className="flex w-full max-w-full flex-row gap-3 overflow-hidden">
                      <Avatar src={item.ImageUrl} alt={[item.FirstName, item.LastName].join(' ').trim()} fallback={initials([item.FirstName, item.LastName].join(' ').trim()).slice(0, 2)} />
                      <div className="flex w-full max-w-full flex-1 flex-col overflow-hidden">
                        <h3 className="my-auto w-[97%] overflow-hidden text-ellipsis whitespace-nowrap text-sm font-normal">{group.seeMore === 'businesses' ? item.BusinessName?.trim() : [item.FirstName, item.LastName].join(' ').trim()}</h3>
                        <div className="mt-1.5">
                          {item.City && item.State && (
                            <div className="mb-1 flex gap-1 text-muted-foreground">
                              <RiMapPin2Line size={15} />
                              <p className="my-auto w-[97%] space-x-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-normal text-muted-foreground">
                                <span>{item.City + ' - ' + item.State}</span>
                              </p>
                            </div>
                          )}
                          {group.seeMore === 'businesses' && (
                            <div className="flex gap-1 text-muted-foreground">
                              <RiNewsLine size={15} />
                              <p className="my-auto w-[97%] space-x-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-normal text-muted-foreground">
                                <span>{item.BusinessTypeName}</span>
                                <span className="mt-1">•</span>
                                <span>{[item.FirstName, item.LastName].join(' ').trim()}</span>
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Referred by */}
                        {globalStore?.currentUser && group.title === 'Business' && globalStore?.currentUser?.uid !== item?.UserId && <MutualFavourites businessOrProfileId={item.UserId} profileData={globalStore.currentUser as unknown as IProfile} />}
                      </div>
                    </div>
                    {item.isFavorite ? <RiHeart2Fill size={24} /> : null}
                  </NextLink>
                ))}
                {group.data.length < 5 || showMore !== null ? null : <Button variant="link/info" onClick={() => handleSetShowMore(group.seeMore)} classes={{ container: 'w-max m-2', label: 'text-[13px] font-medium' }} label={`See more ${group.seeMore}`} />}
              </div>
            );
          })}
          {!isFetchingCompleted ? <Spinner container="fullWidth" color="secondary" size="md" /> : null}
        </div>
      ) : (
        <Spinner container="fullWidth" color="secondary" size="md" />
      )}
    </AppPageLayout>
  );
};

export default SearchIndex;
