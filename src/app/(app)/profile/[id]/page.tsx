import { AppPages } from '@/constants/app-pages.constants';
import ProfileIndex from '@/containers/profile';
import { Metadata } from 'next';
import React from 'react';

interface IProps {}

type Params = {
  id: string;
};

type SearchParams = {
  n?: string;
  btN?: string;
  bN?: string;
};

export async function generateMetadata({ params, searchParams }: { params: Params; searchParams: SearchParams }): Promise<Metadata> {
  const { id } = params;
  const { n = '', btN = '', bN = '' } = searchParams; // Default to empty string if undefined

  const imageUrl = `${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_URL}/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o/Public%2Fog_image_${id}.webp?alt=media`;

  return {
    title: 'Refer`d',
    description: 'Join and refer!',
    openGraph: {
      title: n || 'Refer`d',
      description: btN && bN ? `${btN} • ${bN}`.replaceAll('/', '') : 'Join and Refer!',
      url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/${AppPages.PROFILE}/${id}`,
      siteName: 'Refered',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: 'Profile Image',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
  };
}

const Profile: React.FC<IProps> = () => <ProfileIndex />;

export default Profile;
