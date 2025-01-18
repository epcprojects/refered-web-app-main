import Link from '@/components/ui/link';
import { ExternalPages } from '@/constants/app-pages.constants';
import { cn } from '@/utils/cn.utils';
import Image from 'next/image';
import React from 'react';
import { RiFacebookCircleFill, RiInstagramLine } from 'react-icons/ri';

interface IProps {
  className?: string;
}

const mainImage = { src: '/images/right-side-01.png', alt: 'image' };
const appleBadgeImage = { href: ExternalPages.IOS_APP, src: '/images/apple-store-badge.svg', alt: 'image' };
const social = [
  // { icon: <RiTwitterXLine className="scale-[1.6] opacity-40 transition-transform group-hover:scale-[1.7]" />, href: ExternalPages.TWITTER },
  // { icon: <RiLinkedinBoxFill className="scale-[1.8] opacity-40 transition-transform group-hover:scale-[1.9]" />, href: ExternalPages.LINKEDIN },
  { icon: <RiFacebookCircleFill className="scale-[1.8] opacity-40 transition-transform group-hover:scale-[1.9]" />, href: ExternalPages.FACEBOOK },
  { icon: <RiInstagramLine className="scale-[1.8] opacity-40 transition-transform group-hover:scale-[1.9]" />, href: ExternalPages.INSTAGRAM },
];

const AppRightSideIndex: React.FC<IProps> = ({ className }) => {
  return (
    <aside className={cn('flex flex-col items-center gap-4', className)}>
      <div className="relative z-[40] h-52 w-full overflow-hidden rounded-xl xl:h-60">
        <Image src={mainImage.src} alt={mainImage.alt} fill className="object-fill" />
      </div>
      <Link href={appleBadgeImage.href} classes={{ container: 'mt-1' }} target="_blank">
        <Image src={appleBadgeImage.src} alt={appleBadgeImage.alt} width={110} height={55} />
      </Link>
      <div className="flex flex-row items-center gap-2.5">
        {social.map((item, index) => (
          <Link key={index} variant="ghost" classes={{ container: 'group rounded-full w-10 h-10' }} href={item.href} target="_blank">
            {item.icon}
          </Link>
        ))}
      </div>
    </aside>
  );
};

export default AppRightSideIndex;
