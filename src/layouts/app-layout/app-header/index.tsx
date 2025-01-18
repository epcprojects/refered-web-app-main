'use client';

import Link from '@/components/ui/link';
import { AppPages } from '@/constants/app-pages.constants';
import { Shortcuts } from '@/constants/shortcuts.constants';
import { useHotkey } from '@/hooks/use-hot-key';
import AppNavigation from '@/layouts/app-layout/app-bottom-nav/app-navigation';
import { cn } from '@/utils/cn.utils';
import { getClientOS } from '@/utils/misc.utils';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useMemo } from 'react';
import { RiSearch2Line } from 'react-icons/ri';

interface IProps {}

const AppHeader: React.FC<IProps> = () => {
  const router = useRouter();

  const clientOS = useMemo(() => getClientOS(), []);
  useHotkey('SEARCH', () => router.push(AppPages.SEARCH));

  return (
    <header className="fixed top-0 z-[100] hidden h-header w-full flex-row items-center justify-between bg-card p-4 shadow-sm md:flex">
      <div className="flex flex-row items-center gap-2">
        <Link href={AppPages.HOME}>
          <Image src="/images/logo.png" alt="Logo" width={35} height={35} />
        </Link>
        <Link
          href={AppPages.SEARCH}
          variant="ghost"
          classes={{ container: 'px-2 border-1 border-border items-center justify-start w-[20rem] text-[#AEB3BD] hover:text-foreground/50', label: 'font-normal flex-1 text-left' }}
          label="Search"
          leftElement={<RiSearch2Line className="mb-0.5" />}
          rightElement={
            <kbd className={cn('mb-1 inline-flex h-5 translate-y-0.5 select-none items-center gap-0.5 rounded border-1 border-border px-1.5 font-mono text-[11px] font-medium transition-opacity')}>
              <span className={cn(clientOS === 'MAC' ? 'mt-0.5 text-sm' : '')}>{Shortcuts.SEARCH[`${clientOS}_LABEL`][0]}</span>
              <span>{Shortcuts.SEARCH[`${clientOS}_LABEL`][1]}</span>
            </kbd>
          }
        />
      </div>
      <AppNavigation className="mt-0.5" />
    </header>
  );
};

export default AppHeader;
