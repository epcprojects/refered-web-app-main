'use client';

import { getInstagramFeed } from '@/actions/instagram-feed';
import { cn } from '@/utils/cn.utils';
import { asyncGuard } from '@/utils/lodash.utils';
import NextLink from 'next/link';
import React, { useEffect, useState } from 'react';

interface IProps {
  className?: string;
}

const tempMainImage = { src: '/images/left-side-01.jpg', alt: 'image', postLink: '#' };
const tempImages = [
  { src: '/images/left-side-02.jpg', alt: 'image', postLink: '#' },
  { src: '/images/left-side-03.jpg', alt: 'image', postLink: '#' },
  { src: '/images/left-side-04.jpg', alt: 'image', postLink: '#' },
  { src: '/images/left-side-05.jpg', alt: 'image', postLink: '#' },
  { src: '/images/left-side-06.jpg', alt: 'image', postLink: '#' },
  { src: '/images/left-side-07.jpg', alt: 'image', postLink: '#' },
];

const AppLeftSideIndex: React.FC<IProps> = async ({ className }) => {
  const [mainImage, setMainImage] = useState(tempMainImage);
  const [images, setImages] = useState(tempImages);

  const handleFetchData = async () => {
    const response = await asyncGuard(() => getInstagramFeed());
    if (response.result !== null) {
      let imagesToBeUpdated: { media: string; post: string }[] = [];
      response.result.forEach((item, index) => {
        if (index === 0) setMainImage((prev) => ({ ...prev, src: item.media_url, postLink: item.permalink }));
        imagesToBeUpdated = [...imagesToBeUpdated, { media: item.media_url, post: item.permalink }];
      });
      setImages((prev) => prev.map((item, index) => (imagesToBeUpdated.length > index ? { ...item, src: imagesToBeUpdated[index].media, postLink: imagesToBeUpdated[index].post } : item)));
    }
  };

  useEffect(() => {
    handleFetchData();
  }, []);

  return (
    <aside className={cn('flex flex-col gap-2', className)}>
      <NextLink href={mainImage.postLink} className="relative h-40 w-full overflow-hidden rounded-xl xl:h-44" target="_blank">
        <img src={mainImage.src} alt={mainImage.alt} className="object-cover" />
      </NextLink>
      <div className="grid grid-cols-2 gap-2.5">
        {images.map((item, index) => (
          <NextLink href={item.postLink} key={index} className="relative h-18 w-full overflow-hidden rounded-lg xl:h-20" target="_blank">
            <img src={item.src} alt={item.alt} className="object-cover" />
          </NextLink>
        ))}
      </div>
    </aside>
  );
};

export default AppLeftSideIndex;
