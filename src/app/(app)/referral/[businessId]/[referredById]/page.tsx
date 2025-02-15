import ReferralIndex from '@/containers/referral';
import { Metadata } from 'next';
import React from 'react';

interface IProps {}

type Params = {
  businessId: string;
  referredById: string;
  n?: string;
  h?: string;
};

const sanitizeInput = (value: string) => {
  return value.replaceAll('%20', ' ').replaceAll('%E2%80%A2', '•');
};

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { businessId, referredById, n: title, h: headline } = params;
  const imageUrl = `${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_URL}/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/o/Public%2Freferd_${businessId}.webp?alt=media`;

  return {
    title: 'Refer`d',
    description: 'Join and refer!',
    openGraph: {
      title: sanitizeInput(title || '') || 'Referral Link',
      description: sanitizeInput(headline || '') ?? 'Join using this exclusive referral link!',
      url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/referral/${businessId}/${referredById}`,
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
