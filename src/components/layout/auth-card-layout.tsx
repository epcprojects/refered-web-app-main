import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn.utils';
import Image from 'next/image';
import React from 'react';
import { LuChevronLeft } from 'react-icons/lu';
import { Spinner } from '../ui/spinner';
import AuthPageLayout from './auth-page-layout';

interface IProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  children: React.ReactNode;
  containerClassName?: string;
  coverImageSrc: string;
  notForAuthPage?: boolean;
  isLoading?: boolean;
}

const AuthCardLayout: React.FC<IProps> = ({ title, subtitle, onBack, children, coverImageSrc, containerClassName, notForAuthPage, isLoading }) => {
  return (
    <AuthPageLayout coverImageSrc={coverImageSrc} notForAuthPage={notForAuthPage}>
      <div className="min-h-full flex-1">
        <div className={cn('relative flex flex-col items-center justify-center gap-5 px-4 py-20 md:px-8', notForAuthPage && 'px-4 py-10')}>
          {onBack === undefined ? null : (
            <Button variant="background" size="sm" classes={{ container: cn('rounded-full gap-0 !px-0 !py-1.5 absolute top-2 left-2 h-auto', notForAuthPage && 'top-4.5 left-4') }} onClick={onBack}>
              <LuChevronLeft className="mx-1" />
              <span className="pr-2.5">Back</span>
            </Button>
          )}
          {isLoading ? (
            <Spinner container="fullWidth" color="secondary" size="md" />
          ) : (
            <>
              <Image src="/images/logo.png" alt="Logo" width={60} height={60} />
              <span className="mb-2 space-y-1">
                <h3 className="max-w-[25rem] text-center text-2xl font-medium text-foreground">{title}</h3>
                <p className="max-w-[25rem] text-center text-base text-muted-foreground">{subtitle}</p>
              </span>
              <div className={cn('flex w-full max-w-[30rem] flex-col items-center justify-center gap-5', containerClassName)}>{children}</div>
            </>
          )}
        </div>
      </div>
    </AuthPageLayout>
  );
};

export default AuthCardLayout;
