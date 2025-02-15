import ReferdIndex from '@/containers/referd';
import { Metadata } from 'next';
import React from 'react';

interface IProps {}
const Referd: React.FC<IProps> = () => <ReferdIndex />;

// const APP_URL = 'https://refered-web-app-main.vercel.app';
const APP_URL = 'http://127.0.0.1:3000';
export const metadata: Metadata = {
  title: 'Refer`d',
  description: 'Refered web app built using Next.js',
  openGraph: {
    title: 'Julia Alexander',
    description: 'JA Interior Designer • Interior Design',
    url: APP_URL + '/referd', // Replace with your actual URL
    siteName: 'Refered',
    images: [
      {
        url: 'https://s3-alpha.figma.com/profile/34de83c8-1144-4c3e-9d11-724a5a9ca04e', // Replace with your actual image URL
        width: 800,
        height: 600,
        alt: 'Refered Image Alt Text',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default Referd;
