import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/utils/cn.utils';
import React from 'react';

interface ICommonProps {
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  sectionLoader?: boolean;
  customHeaderClasses?: string;
}

interface IHeaderProps {
  title: string;
  countBadge?: number;
  customHeader?: never;
}

interface ICustomHeaderProps {
  title?: never;
  countBadge?: never;
  customHeader: React.ReactNode;
}

type IProps = (IHeaderProps | ICustomHeaderProps) & ICommonProps;

const AppPageLayout: React.FC<IProps> = ({ children, customHeaderClasses = 'h-[3.5rem] md:h-[4.65rem]', title, countBadge, className, customHeader, isLoading, sectionLoader }) => {
  if (sectionLoader) return <Spinner container="fullWidth" color="secondary" size="md" />;
  return (
    <div>
      <div className={'fixed top-0 z-40 w-full md:top-header md:max-w-[40rem] lg:w-[calc(100%-33.1rem)] lg:max-w-[31.9rem] ' + customHeaderClasses}>
        <div className="h-full w-full bg-card px-4 py-3">
          {!!customHeader ? (
            <>{customHeader}</>
          ) : (
            <div className="flex h-full flex-row items-center gap-2 md:mt-[9px]">
              <h3 className="text-lg font-medium">{title}</h3>
              {countBadge === undefined || countBadge === 0 ? null : <p className="rounded-sm border-1 border-border px-1 text-xs text-muted-foreground">{countBadge}</p>}
            </div>
          )}
        </div>
        <Separator />
      </div>
      <div className={cn('mt-[3.7rem] p-4 py-3', className)}>{isLoading ? <Spinner container="fullWidth" color="secondary" size="md" /> : children}</div>
    </div>
  );
};

export default AppPageLayout;
