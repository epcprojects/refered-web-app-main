'use client';

import Avatar from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from '@/components/ui/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { AppPages } from '@/constants/app-pages.constants';
import { firebase } from '@/firebase';
import { Signout } from '@/firebase/auth';
import { IChatGroup } from '@/firebase/chat';
import { MarkAllHeaderNotificationsAsRead } from '@/firebase/notifications';
import { useAppStore } from '@/hooks/use-app-store';
import { cn } from '@/utils/cn.utils';
import { asyncGuard, initials, startsWith } from '@/utils/lodash.utils';
import { isMobileBrowser } from '@/utils/misc.utils';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { RiChat1Fill, RiChat1Line, RiHome5Fill, RiHome5Line, RiLogoutCircleLine, RiMailLine, RiMoreFill, RiNotification4Fill, RiNotification4Line, RiQuestionLine, RiSearch2Fill, RiSearch2Line } from 'react-icons/ri';
import { toast } from 'sonner';

interface IProps {
  isBottomNav?: boolean;
  className?: string;
}

// prettier-ignore
const navigation = (isBottomNav: boolean) => [
  { href: AppPages.HOME, title: 'Home', icon: <RiHome5Line className="scale-[1.3]" />, activeIcon: <RiHome5Fill className="scale-[1.3]" />, checkIsActive: (pathname: string) => pathname === AppPages.HOME_DEFAULT || pathname === AppPages.HOME  },
  ...(!isBottomNav ? [] : [{ href: AppPages.SEARCH, title: 'Search', icon: <RiSearch2Line className="scale-[1.3]" />, activeIcon: <RiSearch2Fill className="scale-[1.3]" />, checkIsActive: (pathname: string) => pathname === AppPages.SEARCH }]),
  ...(isMobileBrowser() ? [] : [{ href: AppPages.CHATS, title: 'Messages', icon: <RiChat1Line className="scale-[1.3]" />, activeIcon: <RiChat1Fill className="scale-[1.3]" />, checkIsActive: (pathname: string) => pathname.includes(AppPages.CHATS) }]),
  { href: AppPages.NOTIFICATIONS, title: 'Notifications', icon: <RiNotification4Line className="scale-[1.3]" />, activeIcon: <RiNotification4Fill className="scale-[1.3]" />, checkIsActive: (pathname: string) => pathname === AppPages.NOTIFICATIONS },
];

const AppNavigation: React.FC<IProps> = ({ className, isBottomNav = false }) => {
  const pathname = usePathname();
  const globalStore = useAppStore('Global');

  const [isNotificationSubscribed, setIsNotificationSubscribed] = useState(false);
  const [isChatSubscribed, setIsChatSubscribed] = useState(false);

  const handleSignout = async () => {
    const signoutResponse = await asyncGuard(() => Signout());
    if (signoutResponse.error !== null || signoutResponse.result === null) toast.error(signoutResponse.error?.toString() || 'Something went wrong!');
    else {
      toast.success('Signed out successfully!');
      window.location.reload();
      globalStore?.setCurrentUserAndProfile({ user: null, profile: null });
    }
  };

  useEffect(() => {
    if (globalStore === null || globalStore.currentUser === null || isNotificationSubscribed) return;
    setIsNotificationSubscribed(true);
    const unsuscribe = onSnapshot(query(collection(firebase.firestore, firebase.collections.notifications), where('toUser', '==', globalStore.currentUser.uid), where('isReadFromHeader', '==', '0')), (snapshot) => {
      if (pathname === AppPages.NOTIFICATIONS) MarkAllHeaderNotificationsAsRead({ toUserId: globalStore.currentUser?.uid || '' });
      else globalStore?.updateNotificationsCount(snapshot.docs.length);
    });

    return () => unsuscribe();
  }, [globalStore?.currentUser?.uid]);

  useEffect(() => {
    if (globalStore === null || globalStore.currentUser === null || isChatSubscribed) return;
    setIsChatSubscribed(true);
    const unsuscribe = onSnapshot(query(collection(firebase.firestore, firebase.collections.chatGroups), where('participants', 'array-contains', globalStore.currentUser.uid)), (snapshot) => {
      const chatGroups = snapshot.docs.map((item) => ({ ...item.data(), id: item.id }) as IChatGroup);
      const totalCount = chatGroups.reduce((acc, curr) => {
        if (startsWith(AppPages.CHATS, window.location.pathname) && window.location.pathname.split('/')[2] === curr.id) return acc + 0;
        let count = 0;
        if (curr.from.senderId === globalStore.currentUser?.uid) count += curr.fromUserUnreadMessagesCount;
        else if (curr.to.userId === globalStore.currentUser?.uid) count += curr.toUserUnreadMessagesCount;
        // if (curr.from.senderId === globalStore.currentUser?.uid && curr.fromUserReadFromHeader === '0') count += curr.fromUserUnreadMessagesCount;
        // else if (curr.to.userId === globalStore.currentUser?.uid && curr.toUserReadFromHeader === '0') count += curr.toUserUnreadMessagesCount;
        return acc + count;
      }, 0);

      globalStore.updateMessagesCount(totalCount);
    });

    return () => unsuscribe();
  }, [globalStore?.currentUser?.uid]);

  return (
    <nav className={cn('flex w-[18rem] flex-row items-center justify-around gap-0', className)}>
      {navigation(isBottomNav).map((item) => {
        const isActive = item.checkIsActive(pathname);
        return (
          <Link key={item.href} href={item.href}>
            <div className={cn('flex flex-col items-center justify-center gap-1.5 rounded-md px-3 py-1.5 font-normal transition-all hover:bg-accent')}>
              <span className={cn('relative block w-max items-center', !isActive && 'text-foreground/50')}>
                <span>{isActive ? item.activeIcon : item.icon}</span>
                {globalStore && globalStore.messagesCount > 0 && item.href === AppPages.CHATS ? <span className="absolute -right-1.5 -top-1 z-10 flex h-3 min-w-3 items-center justify-center rounded-full bg-red-500 px-[2px] text-center text-[9px] font-medium leading-none text-card">{globalStore.messagesCount >= 100 ? '99+' : globalStore.messagesCount}</span> : null}
                {globalStore && globalStore.notificationsCount > 0 && item.href === AppPages.NOTIFICATIONS ? <span className="absolute -right-1.5 -top-1 z-10 flex h-3 min-w-3 items-center justify-center rounded-full bg-red-500 px-[2px] text-center text-[9px] font-medium leading-none text-card">{globalStore.notificationsCount >= 100 ? '99+' : globalStore.notificationsCount}</span> : null}
              </span>
              <span className="block text-xs">{item.title}</span>
            </div>
          </Link>
        );
      })}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="link/secondary">
            <div className={cn('flex flex-col items-center justify-center gap-1.5 rounded-md px-3 py-1.5 font-normal transition-all hover:bg-accent')}>
              <span className={cn('block w-max items-center text-foreground/50')}>
                <RiMoreFill />
              </span>
              <span className="block text-xs">More</span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-52 p-1" align="end" alignOffset={isBottomNav ? 0 : -10} side="bottom" sideOffset={isBottomNav ? 0 : 10}>
          <NextLink href={AppPages.HOME} className="flex flex-row items-center gap-2 p-2">
            <Avatar src={globalStore?.currentUserProfile?.ImageUrl} alt={[globalStore?.currentUserProfile?.FirstName, globalStore?.currentUserProfile?.LastName].join(' ').trim()} fallback={initials([globalStore?.currentUserProfile?.FirstName, globalStore?.currentUserProfile?.LastName].join(' ').trim()).slice(0, 2)} className="!h-8 !w-8" />
            <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
              <h3 className="max-w-full truncate text-sm font-medium leading-none">{[globalStore?.currentUserProfile?.FirstName, globalStore?.currentUserProfile?.LastName].join(' ').trim()}</h3>
              <p className="max-w-full truncate text-xs leading-none text-muted-foreground">{globalStore?.currentUserProfile?.userEmail}</p>
            </div>
          </NextLink>
          <Separator />
          <div className="mt-1 flex flex-col gap-0.5">
            <Link href={AppPages.FAQS} label="FAQ" leftElement={<RiQuestionLine />} variant="ghost" classes={{ container: 'justify-start h-7.5 px-2 gap-3', label: 'font-normal' }} />
            <Link href={AppPages.CONTACT} label="Contact Us" leftElement={<RiMailLine />} variant="ghost" classes={{ container: 'justify-start h-7.5 px-2 gap-3', label: 'font-normal' }} />
            <Button onClick={handleSignout} label="Logout" leftElement={<RiLogoutCircleLine />} variant="ghost" classes={{ container: 'justify-start h-7.5 px-2 gap-3', label: 'font-normal !not-sr-only' }} />
          </div>
        </PopoverContent>
      </Popover>
    </nav>
  );
};

export default AppNavigation;
