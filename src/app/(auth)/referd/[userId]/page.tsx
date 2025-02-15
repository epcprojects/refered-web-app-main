import ReferdIndex from '@/containers/referd';
import { Metadata } from 'next';
import React from 'react';

interface IProps {}

type Params = {
  userId: string;
};

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { userId } = params;
  const imageUrl = `${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_URL}/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o/Public%2Freferd_${userId}.webp?alt=media`;

  return {
    title: 'Refer`d',
    description: 'Join and refer!',
    openGraph: {
      title: `Referral from ${userId}`,
      description: 'Join using this exclusive referral link!',
      url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/referd/${userId}`,
      siteName: 'Refered',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
          alt: 'Referral Image',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
  };
}

const Referd: React.FC<IProps> = () => <ReferdIndex />;

export default Referd;
