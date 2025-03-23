'use client';

// import { useFCM } from '@/hooks/use-fcm';
// import { useNotificationPermission } from '@/hooks/use-notification-permission';
import { cn } from '@/utils/cn.utils';
import React from 'react';
import AppBottomNav from './app-bottom-nav';
import AppHeader from './app-header';
import AppLeftSideIndex from './app-left-side';
import AppMainIndex from './app-main';
import AppRightSideIndex from './app-right-side';

interface IProps {
  children: React.ReactNode;
}

const mainWidthAndHeightClasses = cn('h-full w-full max-w-full lg:max-w-[65rem] xl:max-w-[70rem]');
const asideClasses = cn('h-max z-10 sticky hidden lg:flex top-20 w-[12.5rem] transition-all lg:w-[15rem] xl:w-[17.5rem] rounded-md');

const AppLayoutIndex: React.FC<IProps> = ({ children }) => {
  // useNotificationPermission();
  // useFCM();

  return (
    <div className="relative flex min-h-page flex-1 flex-col items-center justify-center bg-muted/60">
      <AppHeader />
      <main className={cn('mb-bottomNav mt-0 flex flex-1 flex-row gap-4 transition-all md:mb-0 md:mt-header md:p-4', mainWidthAndHeightClasses)}>
        <AppLeftSideIndex className={asideClasses} />
        <AppMainIndex mainWidthAndHeightClasses={mainWidthAndHeightClasses}>{children}</AppMainIndex>
        <AppRightSideIndex className={asideClasses} />
      </main>
      <AppBottomNav />
    </div>
  );
};

export default AppLayoutIndex;
