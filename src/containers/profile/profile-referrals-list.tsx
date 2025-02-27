'use client';

import EmptyList from '@/components/common/empty-list';
import Avatar from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import Link from '@/components/ui/link';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { AppPages } from '@/constants/app-pages.constants';
import { firebase } from '@/firebase';
import { handleDeformatPhoneNumberForAPI } from '@/firebase/auth';
import { GetOrCreateChatGroup } from '@/firebase/chat';
import { IFavorite } from '@/firebase/favorite';
import { IProfile } from '@/firebase/profile';
import { GetAllReferralsByUserId, GetMutualFavouritesForProfile, IReferral, RedeemReferral, UpdateReferralChatGroupId } from '@/firebase/referral';
import { useAppStore } from '@/hooks/use-app-store';
import { date } from '@/utils/date.utils';
import { asyncGuard, initials, unionBy } from '@/utils/lodash.utils';
import { isMobileBrowser } from '@/utils/misc.utils';
import { useEventListener } from '@/utils/use-hooks.utils';
import Image from 'next/image';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { RiMapPin2Line, RiMessage3Line, RiNewsLine, RiPhoneFill, RiShareForwardFill } from 'react-icons/ri';
import { toast } from 'sonner';
import ProfileListDialog from './profile-list-dialog';

interface IProps {
  profileData: IProfile;
}

const ProfileReferralsList: React.FC<IProps> = ({ profileData }) => {
  const [isAllFetched, setIsAllFetched] = useState(false);
  const [data, setData] = useState<IReferral[]>([]);
  const [isFetchingData, setIsFetchingData] = useState(true);

  const handleFetchReferralsData = async () => {
    setIsFetchingData(true);
    const response = await asyncGuard(() => GetAllReferralsByUserId({ userId: profileData.UserId, lastItemId: data.length <= 0 ? undefined : data[data.length - 1].id }));
    if (response.error !== null || response.result === null) toast.error(response.error?.toString() || 'Something went wrong!');
    else {
      setData((prev) => unionBy(prev, response.result, 'id'));
      if (response.result.length < firebase.pagination.pageSize) setIsAllFetched(true);
    }
    setIsFetchingData(false);
  };

  useEffect(() => {
    handleFetchReferralsData();
  }, []);

  useEventListener('scroll', () => {
    if (isAllFetched || isFetchingData) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const documentHeight = document.documentElement.scrollHeight;
    if (scrollTop + windowHeight >= documentHeight) handleFetchReferralsData();
  });

  if (!isFetchingData && data.length <= 0) return <EmptyList type="referrals" />;
  return (
    <>
      {data.map((item, index) => (
        <React.Fragment key={item.id}>
          {index > 0 && <Separator className="opacity-50" />}
          <ReferralItem profileData={profileData} data={item} isRedeemed={item.isRedeemed === '1'} />
        </React.Fragment>
      ))}
      {isFetchingData ? <Spinner container="fullWidth" color="secondary" size="md" /> : null}
    </>
  );
};

export default ProfileReferralsList;

interface IMutualFavourites extends IProps {
  mutualFavourites?: IFavorite[];
  businessOrProfileId: string;
  shade?: 'dark' | 'light';
}

export const MutualFavourites: React.FC<IMutualFavourites> = ({ mutualFavourites, businessOrProfileId, profileData, shade = 'light' }) => {
  const [data, setData] = useState<IFavorite[]>(mutualFavourites ?? []);
  const [isFetchingData, setIsFetchingData] = useState(false);

  const handleFetchMutualFavourites = async () => {
    if (mutualFavourites?.length) return;

    setIsFetchingData(true);
    const response = await asyncGuard(() => GetMutualFavouritesForProfile({ userId: profileData?.uid || '', profileUserId: businessOrProfileId, lastItemId: undefined }));
    if (response.error !== null || response.result === null) toast.error(response.error?.toString() || 'Something went wrong!');
    else {
      setData((prev) => unionBy(prev, response.result, 'id'));

      // if (response.result.length < firebase.pagination.pageSize) setIsAllFetched(true);
    }
    setIsFetchingData(false);
  };

  useEffect(() => {
    handleFetchMutualFavourites();
  }, []);

  if (!isFetchingData && data.length === 0) return null;

  return (
    <div className="mt-1.5 flex flex-col items-start gap-1.5 2xs:flex-row 2xs:items-center">
      {isFetchingData ? (
        <span className={`text-xs ${shade === 'light' ? 'text-muted-foreground' : ''}`}>Loading...</span>
      ) : (
        <React.Fragment>
          <div className="flex items-center justify-center gap-1">
            <RiShareForwardFill className="text-info" color={shade === 'dark' ? 'black' : ''} />
            <span className={`text-xs ${shade === 'light' ? 'text-muted-foreground' : ''}`}>Referred by</span>
          </div>

          {data.slice(0, 3).map((value) => (
            <ReferralUserChip shade="dark" id={value.ProfileId || ''} src={value?.ImageUrl || ''} name={value?.FirstName || ''} />
          ))}

          {data.length > 3 && <ProfileListDialog shade="dark" data={data} count={data.length - 3} />}
        </React.Fragment>
      )}
    </div>
  );
};

export const ReferralUserChip: React.FC<{ id: string; src?: string; name: string; shade?: 'dark' | 'light'; className?: string; showAvatar?: boolean }> = ({ id, src, name, shade = 'light', showAvatar = true, className = 'rounded-full' }) => (
  <NextLink href={`${AppPages.PROFILE}/${id}`} className={`flex cursor-pointer items-center gap-1 border-1 ${shade === 'dark' ? 'border-black border-opacity-15' : 'border-border'} p-[3px] transition-all hover:bg-slate-100 ${className}`}>
    {showAvatar === true && <Avatar src={src} alt="Profile Picture" fallback={initials('Mohsin').slice(0, 1)} className="!h-4 !w-4" fallbackClassName="!text-[9px]" />}
    <span className="mr-0.5 w-max max-w-16 overflow-hidden text-ellipsis whitespace-nowrap text-[11px] 2xs:max-w-10 xs:max-w-18">{name}</span>
  </NextLink>
);

const ReferralItem: React.FC<IProps & { data: IReferral; isRedeemed: boolean }> = ({ profileData, data, isRedeemed }) => {
  const router = useRouter();
  const globalStore = useAppStore('Global');

  const type = useMemo<'to' | 'by' | 'business'>(() => (profileData.UserId === data.referredByUserId ? 'by' : profileData.UserId === data.referredToUserId ? 'to' : 'business'), [data]);
  const userReferral = useMemo(() => (type === 'business' ? data.referredToUser : data.referredBusinessUser), [type]);
  const myType = useMemo<'to' | 'by' | 'business' | null>(() => (globalStore?.currentUser?.uid === data.referredByUserId ? 'by' : globalStore?.currentUser?.uid === data.referredToUserId ? 'to' : globalStore?.currentUser?.uid === data.referredBusinessUserId ? 'business' : null), [globalStore, data]);

  const [isInitiatingChat, setIsInitiatingChat] = useState(false);
  const [isRedeemPopupOpened, setIsRedeemPopupOpened] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [hasRedeemed, setHasRedeemed] = useState(isRedeemed);

  const handleIntitiateChat = async () => {
    if (!!data.messageGroupId) {
      router.push(`${AppPages.CHAT_MESSAGES}/${data.messageGroupId}`);
      return;
    }

    if (globalStore?.currentUserProfile === null) return;
    setIsInitiatingChat(true);
    const response = await asyncGuard(() => GetOrCreateChatGroup({ fromUser: globalStore?.currentUserProfile as IProfile, toUser: type === 'business' ? { UserId: data.referredToUser?.UserId || '', FirstName: data.referredToUser?.FirstName || '', LastName: data.referredToUser?.LastName || '' } : { UserId: data.referredBusinessUser?.UserId || '', FirstName: data.referredBusinessUser?.FirstName || '', LastName: data.referredBusinessUser?.LastName || '' } }));
    if (response.error !== null || response.result === null) {
      toast.error(response.error?.toString() || 'Something went wrong!');
      setIsInitiatingChat(false);
    } else {
      UpdateReferralChatGroupId({ id: data.id, messageGroupId: response.result.id });
      router.push(`${AppPages.CHAT_MESSAGES}/${response.result.id}`);
    }
  };

  return (
    <>
      <RedeemConfirmationDialog isOpen={isRedeemPopupOpened} onClose={() => setIsRedeemPopupOpened(false)} data={data} isRedeeming={isRedeeming} hasRedeemed={hasRedeemed} setHasRedeemed={setHasRedeemed} setIsRedeeming={setIsRedeeming} />
      <div className="flex flex-row gap-3 py-2">
        <NextLink href={`${AppPages.PROFILE}/${userReferral?.UserId}`} className="cursor-pointer">
          <Avatar src={type === 'business' ? data.referredToUser?.ImageUrl : data.referredBusinessUser?.ImageUrl} alt={[data.referredBusinessUser?.FirstName, data.referredBusinessUser?.LastName].join(' ').trim()} fallback={initials([data.referredBusinessUser?.FirstName, data.referredBusinessUser?.LastName].join(' ').trim()).slice(0, 2)} />
        </NextLink>
        <div className="w-full">
          <div className="flex flex-row gap-3">
            <div className="flex w-full max-w-full flex-1 flex-col overflow-hidden">
              <NextLink href={`${AppPages.PROFILE}/${userReferral?.UserId}`} className="cursor-pointer">
                <h3 className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-normal">{(userReferral?.BusinessName || userReferral?.FirstName || 'New Referral').trim()}</h3>
              </NextLink>
              <p className="space-x-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-normal text-muted-foreground">
                {userReferral?.City && userReferral?.State && (
                  <div className="mb-1 mt-[5px] flex gap-1 text-muted-foreground">
                    <RiMapPin2Line size={15} />
                    <p className="my-auto w-[97%] space-x-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-normal text-muted-foreground">
                      <span>{userReferral.City + ', ' + userReferral.State}</span>
                    </p>
                  </div>
                )}

                {(userReferral?.BusinessTypeName || userReferral?.FirstName || userReferral?.LastName) && (
                  <div className="!ml-0 flex gap-1 text-muted-foreground">
                    <RiNewsLine size={15} />
                    <p className="my-auto w-[97%] space-x-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-normal text-muted-foreground">
                      <span>{userReferral?.BusinessTypeName}</span>
                      <span className="mt-1">•</span>
                      <span>{[userReferral?.FirstName, userReferral?.LastName].join(' ').trim()}</span>
                    </p>
                  </div>
                )}
              </p>
            </div>
            <div className="flex flex-shrink-0 flex-col items-end gap-0.5">
              <p className="text-xs text-muted-foreground">{date.format(date.fromUnixTime(data.datetime.seconds), 'dd MMM yyyy')}</p>
              <div className="flex flex-row gap-1">
                {hasRedeemed || (type === 'to' && myType === 'to') ? (
                  <Button variant="secondary" size="sm" classes={{ container: 'disabled:bg-foreground/5 disabled:text-foreground rounded-md p-[5px] px-2.5 h-max' }} disabled={hasRedeemed || isRedeeming || isInitiatingChat} onClick={() => setIsRedeemPopupOpened(true)}>
                    {isRedeeming ? <Spinner color="secondary" size="sm" /> : hasRedeemed ? 'Redeemed' : 'Redeem'}
                  </Button>
                ) : null}
                {type === 'to' && myType === 'to' ? (
                  <Link href={`tel:${handleDeformatPhoneNumberForAPI(data.referredBusinessUser?.PhoneNo || '')}`} variant="background" size="sm" classes={{ container: 'bg-foreground/5 rounded-md p-[5px] aspect-square h-max' }} disabled={isRedeeming || isInitiatingChat}>
                    <RiPhoneFill />
                  </Link>
                ) : null}
                {type === 'business' && myType === 'business' ? (
                  <Link href={`tel:${handleDeformatPhoneNumberForAPI(data.referredToUser?.PhoneNo || '')}`} variant="background" size="sm" classes={{ container: 'bg-foreground/5 rounded-md p-[5px] aspect-square h-max' }} disabled={isRedeeming || isInitiatingChat}>
                    <RiPhoneFill />
                  </Link>
                ) : null}
                {Boolean(isMobileBrowser() && type === 'business' && myType === 'business') ? (
                  <Link href={`sms:${handleDeformatPhoneNumberForAPI(data.referredToUser?.PhoneNo || '')}`} variant="background" size="sm" classes={{ container: 'bg-foreground/5 rounded-md p-[5px] aspect-square h-max' }} disabled={isRedeeming || isInitiatingChat}>
                    <RiMessage3Line />
                  </Link>
                ) : Boolean(isMobileBrowser() && type === 'to' && myType === 'to') ? (
                  <Link href={`sms:${handleDeformatPhoneNumberForAPI(data.referredBusinessUser?.PhoneNo || '')}`} variant="background" size="sm" classes={{ container: 'bg-foreground/5 rounded-md p-[5px] aspect-square h-max' }} disabled={isRedeeming || isInitiatingChat}>
                    <RiMessage3Line />
                  </Link>
                ) : Boolean((type === 'business' && myType === 'business') || (type === 'to' && myType === 'to')) ? (
                  <Button variant="background" size="sm" classes={{ container: 'bg-foreground/5 rounded-md p-[5px] aspect-square h-max' }} onClick={handleIntitiateChat} disabled={isRedeeming || isInitiatingChat}>
                    {isInitiatingChat ? <Spinner color="secondary" size="sm" /> : <RiMessage3Line />}
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
          {/* {type === 'business' ? ( */}
          <div className="mt-3 flex flex-col items-start gap-1.5 2xs:flex-row 2xs:items-center">
            <ReferralUserChip id={data.referredByUser?.UserId || ''} className="rounded-sm" src={data.referredByUser?.ImageUrl} name={[data.referredByUser?.FirstName].join(' ').trim()} />
            <span className="text-xs text-muted-foreground">refer'd to</span>
            <ReferralUserChip id={data.referredToUser?.UserId || ''} className="rounded-sm" src={data.referredToUser?.ImageUrl} name={[data.referredToUser?.FirstName].join(' ').trim()} />
          </div>
          {/* // ) : (
          //   <div className="mt-1.5 flex flex-col items-start gap-1.5 2xs:flex-row 2xs:items-center">
          //     <div className="flex items-center justify-center gap-1">
          //       <RiShareForwardFill className="text-info" />
          //       <span className="text-xs text-muted-foreground">Referred {type === 'to' ? 'by' : 'to'}</span>
          //     </div>
          //     <ReferralUserChip id={type === 'by' ? data.referredToUser?.UserId || '' : data.referredByUser?.UserId || ''} className="rounded-sm" src={type === 'by' ? data.referredToUser?.ImageUrl : data.referredByUser?.ImageUrl} name={[type === 'by' ? [data.referredToUser?.FirstName].join(' ').trim() : data.referredByUser?.FirstName].join(' ').trim()} />
          //   </div>
          // )} */}
        </div>
      </div>
    </>
  );
};

const RedeemConfirmationDialog: React.FC<{ isOpen: boolean; onClose: () => void; data: IReferral; isRedeeming: boolean; hasRedeemed: boolean; setIsRedeeming: (val: boolean) => void; setHasRedeemed: (val: boolean) => void }> = ({ isOpen, onClose, data, isRedeeming, hasRedeemed, setHasRedeemed, setIsRedeeming }) => {
  const handleClose = () => (!isRedeeming ? onClose() : null);
  const handleRedeem = async () => {
    if (hasRedeemed) return;
    setIsRedeeming(true);
    const response = await asyncGuard(() => RedeemReferral({ id: data.id, referralData: data }));
    if (response.error !== null || response.result === null) toast.error(response.error?.toString() || 'Something went wrong!');
    else {
      setHasRedeemed(true);
      toast.success('Redeemed successfully!');
      handleClose();
    }
    setIsRedeeming(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="flex max-w-[90%] flex-col items-center justify-center p-8 md:w-[28rem]">
        <Image src="/images/info-icon.svg" alt="Redeem Confirm" width={60} height={60} className="rotate-180" />
        <div className="flex- mb-2 w-full flex-col items-center justify-center">
          <h3 className="text-center text-xl font-medium">Are you sure you want to redeem?</h3>
          {!!data.referredBusinessUser && data.referredBusinessUser.DiscountPercent !== undefined ? (
            <p className="mt-1 text-center">
              By clicking <strong>"Redeem"</strong> you will get {data.referredBusinessUser?.DiscountPercent}% discount from <strong>"{[data.referredBusinessUser?.FirstName, data.referredBusinessUser?.LastName].join(' ').trim()}"</strong>
            </p>
          ) : null}
        </div>
        <div className="flex w-full flex-row gap-4">
          <Button variant="border" size="lg" disabled={isRedeeming} onClick={handleClose} classes={{ container: 'border-secondary border-2 flex-1' }}>
            Cancel
          </Button>
          <Button variant="secondary" size="lg" disabled={isRedeeming} onClick={handleRedeem} classes={{ container: 'flex-1' }}>
            {isRedeeming ? <Spinner color="secondary-foreground" size="sm" className="mr-1" /> : null}
            <span>Yes, Redeem</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
