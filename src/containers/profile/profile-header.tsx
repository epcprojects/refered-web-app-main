'use client';

import Avatar from '@/components/ui/avatar';
import { Spinner } from '@/components/ui/spinner';
import { AppPages } from '@/constants/app-pages.constants';
import { ToggleMarkFavorite } from '@/firebase/favorite';
import { IProfile, IProfileWithFavorites } from '@/firebase/profile';
import { useAppStore } from '@/hooks/use-app-store';
import { asyncGuard, initials } from '@/utils/lodash.utils';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { RiAddLine, RiArrowLeftSLine, RiClipboardLine, RiEditBoxLine, RiHeart2Fill, RiHeart2Line, RiMapPin2Line, RiNewsLine, RiPencilFill, RiSecurePaymentLine, RiShareBoxLine } from 'react-icons/ri';
import { toast } from 'sonner';
import { useCopyToClipboard } from 'usehooks-ts';
import { MutualFavourites } from './profile-referrals-list';

interface IProps {
  data: IProfileWithFavorites;
}

const ProfileHeader: React.FC<IProps> = ({ data }) => {
  const router = useRouter();
  const pathname = usePathname();
  const globalStore = useAppStore('Global');
  const [_, copy] = useCopyToClipboard();

  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [isFavorite, setIsFavorite] = useState(data.isFavorite);

  const isProfileDetailsPage = useMemo(() => pathname.includes(AppPages.PROFILE), [pathname]);
  const isBusinessProfile = useMemo(() => data.UserType === 'Business', [data]);
  const isMyProfile = useMemo(() => Boolean(globalStore?.currentUserProfile?.UserId === data.UserId), [data, globalStore]);
  const referralUrl = useMemo(() => `${process.env.NEXT_PUBLIC_FRONTEND_URL}${isBusinessProfile ? `${AppPages.REFERRAL}/${data.UserId}/${globalStore?.currentUserProfile?.UserId}` : `${AppPages.PROFILE}/${data.UserId}`}`, [data, isBusinessProfile, globalStore]);
  const hasPaymentIdAdded = useMemo(() => Boolean(data.paypalId || data.cashAppId || data.venmoId), [data]);
  const defaultPaymentMethod = useMemo(() => data.default && data.default[0].toUpperCase() + data.default.substring(1) || '', [data]);

  const handleGoBack = () => {
    if (document.referrer) router.back();
    else router.push(AppPages.HOME);
  };
  // Drew Dixon shared a referral to Ashley Dixon with Alexander Renee Design. Click the link to open Refer’d and get connected with Ashley now.
  const shareReferralLink = async (referralUrl: string) => {
    if (typeof window !== 'undefined' && navigator.share) {
      const response = await asyncGuard(() => navigator.share({ title: 'Referral Link', text: `${(globalStore?.currentUserProfile?.FirstName + ' ' + globalStore?.currentUserProfile?.LastName).trim()} shared a referral to ${data.FirstName + ' ' + data.LastName} with ${data.BusinessName}. Click the link to open Refer’d and get connected with ${data.FirstName} now.`, url: referralUrl }));
      if (!response.error) {
        const copied = await asyncGuard(() => copy(referralUrl));
        if (copied.result) toast.success('Referral link copied!');
      }
    } else {
      const copied = await asyncGuard(() => copy(referralUrl));
      if (copied.result) toast.success('Referral link copied!');
    }
  };

  const handleShareProfile = async () => {

    if(isBusinessProfile){
      await shareReferralLink(referralUrl + `?n=${data.FirstName}&btN=${data.BusinessTypeName}&bN=${data.BusinessName}/`); //NOTE: Adding / slash is important for Whatsapp to fetch url.
    } else await shareReferralLink(referralUrl); 

  };

  const handleToggleFavorite = async () => {
    if (globalStore === null || globalStore.currentUser === null) return;
    setIsTogglingFavorite(true);
    const response = await asyncGuard(() => ToggleMarkFavorite({ userId: globalStore.currentUser?.uid || '', toggleFavoriteUserId: data.UserId }));
    if (response.error !== null || response.result === null) toast.error(response.error?.toString() || 'Something went wrong!');
    else {
      toast.success(isFavorite ? 'Removed from favorite!' : 'Marked profile as favorite!');
      setIsFavorite((prev) => !prev);
    }
    setIsTogglingFavorite(false);
  };

  // prettier-ignore
  const getButtonsConfig = () => [
    ...(isMyProfile ? [] : [{ icon: isTogglingFavorite ?  <Spinner  color="secondary" size="sm" /> : isFavorite ? <RiHeart2Fill size={20} /> :  <RiHeart2Line size={20} />, onClick: handleToggleFavorite }]),
    { icon: <RiShareBoxLine size={20} />, onClick: handleShareProfile },
    ...(!isMyProfile ? [] : [{ icon: <RiPencilFill size={20} />, href: AppPages.EDIT_PROFILE }]),
  ]

  const getPersonalInfoConfig = () => [
    data.City && data.State ? { icon: <RiMapPin2Line size={15} />, title: `${data.City}, ${data.State}` } : {},
    // { icon: <RiPhoneFill size={15} />, title: handleDeformatPhoneNumberForAPI(data.PhoneNo) },
  ];

  const getCompanyInfoConfig = () => [
    { icon: <RiClipboardLine size={15} />, title: data.BusinessName },
    { icon: <RiNewsLine size={15} />, title: data.BusinessTypeName },
    data.City && data.State ? { icon: <RiMapPin2Line size={15} />, title: `${data.City}, ${data.State}` } : {},
    // { icon: <RiPhoneFill size={15} />, title: handleDeformatPhoneNumberForAPI(data.PhoneNo) },
  ];

  return (
    <div className="space-y-4 bg-primary px-5 py-4">
      <div className="flex flex-row items-center justify-between">
        <div className="flex w-full max-w-full flex-row items-center gap-2 overflow-hidden">
          {!isProfileDetailsPage ? null : (
            <button type="button" onClick={handleGoBack} className="group cursor-pointer">
              <RiArrowLeftSLine size={25} className="transition-all group-hover:-translate-x-0.5" />
            </button>
          )}
          <h3 className="line-clamp-1 w-full text-xl font-medium">Profile</h3>
        </div>
        <div className="flex flex-row gap-1">
          {getButtonsConfig().map((item, index) =>
            !!item.href ? (
              <NextLink key={index} href={item.href} className="rounded-full p-1 hover:bg-foreground/5">
                {item.icon}
              </NextLink>
            ) : (
              <button key={index} onClick={item.onClick} className="rounded-full p-1 hover:bg-foreground/5">
                {item.icon}
              </button>
            ),
          )}
        </div>
      </div>
      <div className="flex flex-row gap-3">
        <Avatar src={data.ImageUrl} alt={[data.FirstName, data.LastName].join(' ').trim()} fallback={initials([data.FirstName, data.LastName].join(' ').trim()).slice(0, 2)} className="!h-14 !w-14" />
        <div className="flex flex-col justify-center gap-1">
          <h5 className="text-base font-medium">{[data.FirstName, data.LastName].join(' ').trim()}</h5>
          {(isBusinessProfile ? getCompanyInfoConfig() : getPersonalInfoConfig()).map((item, index) => (
            <div key={index} className="flex flex-row items-center gap-2 text-sm font-normal">
              <span>{item.icon}</span>
              <span className="mt-0.5">{item.title}</span>
            </div>
          ))}

          {/* Select Payment */}
          {globalStore?.currentUser?.uid === data?.UserId ? (
            <NextLink href={AppPages.EDIT_PROFILE + '?q=payment'} className="rounded-full p-1 pl-0 transition-all duration-300 hover:bg-foreground/5 hover:pl-1">
              <button className="flex flex-row items-center gap-2 text-sm font-medium">
                <span>{hasPaymentIdAdded ? <RiEditBoxLine size={17} /> : <RiAddLine size={17} />}</span>
                <span>{hasPaymentIdAdded ? 'Edit payment method' : 'Select Venmo, Paypal, CashApp'}</span>
              </button>
            </NextLink>
          ): defaultPaymentMethod && !isBusinessProfile ?
              (
              <div className="flex flex-row items-center gap-1.5 text-sm">
                    <span><RiSecurePaymentLine size={17} /></span>
                    <span>Payment Method: <b>{defaultPaymentMethod}</b></span>
              </div>
          )
          :null}
          

          {/* Referred by */}
          {globalStore?.currentUser && data && globalStore?.currentUser?.uid !== data?.UserId && <MutualFavourites shade="dark" mutualFavourites={data.mutualFavourites} businessOrProfileId={data.UserId} profileData={globalStore.currentUser as unknown as IProfile} />}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
