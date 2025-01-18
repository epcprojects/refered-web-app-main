import { cn } from '@/utils/cn.utils';
import { isValidUrl } from '@/utils/lodash.utils';
import clsx from 'clsx';
import Image from 'next/image';
import React from 'react';
import { RiUser3Line } from 'react-icons/ri';

interface IProps {
  className?: string;
  src: string | null | undefined;
  alt: string;
  fallback?: string;
  fallbackClassName?: string;
}

const Avatar: React.FC<IProps> = ({ src, alt, fallback, fallbackClassName, className }) => {
  // return <div className={clsx('relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full', className)}>{src === null || src === undefined || !isValidUrl(src) ? <p className={cn('flex h-full w-full items-center justify-center rounded-full bg-background text-sm font-normal text-foreground', fallbackClassName)}>{fallback}</p> : <Image src={src} alt={alt} fill className="object-cover" />}</div>;
  return (
    <div className={clsx('relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full border-1 border-black/5', className)}>
      {src === null || src === undefined || !isValidUrl(src) ? (
        <div className={cn('flex h-full w-full items-center justify-center rounded-full bg-background text-sm font-normal text-foreground', fallbackClassName)}>
          <RiUser3Line className="h-[50%] w-[50%]" />
        </div>
      ) : (
        <Image src={src} alt={alt} fill className="object-cover" />
      )}
    </div>
  );
};

export default Avatar;
