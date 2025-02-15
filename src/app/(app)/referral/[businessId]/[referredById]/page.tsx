import ReferralIndex from '@/containers/referral';
import { Metadata } from 'next';
import React from 'react';

interface IProps {}

type Params = {
  businessId: string;
  referredById: string;
};

type SearchParams = {
  n?: string;
  btN?: string;
  bN?: string;
};

export async function generateMetadata({ params, searchParams }: { params: Params; searchParams: SearchParams }): Promise<Metadata> {
  const { businessId, referredById } = params;
  const { n = '', btN = '', bN = '' } = searchParams; // Default to empty string if undefined

  const imageUrl = `${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_URL}/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o/Public%2Freferd_${businessId}.webp?alt=media`;

  return {
    title: 'Refer`d',
    description: 'Join and refer!',
    openGraph: {
      title: n || 'Referral',
      description: btN && bN ? `${btN} • ${bN}` : 'Referral program',
      url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/referral/${businessId}/${referredById}?n=${n}&btN=${btN}&bN=${bN}`,
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

const Referral: React.FC<IProps> = () => <ReferralIndex />;

export default Referral;
