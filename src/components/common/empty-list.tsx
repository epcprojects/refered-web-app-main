import Image from 'next/image';
import React from 'react';

interface IProps {
  type: 'referrals' | 'favorites' | 'messages' | 'notifications' | 'noDataFound' | '404';
}

const EmptyList: React.FC<IProps> = ({ type }) => (
  <div className="my-28 flex flex-col items-center justify-center gap-4">
    <Image src="/images/empty-list.svg" alt="Empty List" width={50} height={50} />
    <p className="text-sm font-medium">{type === '404' ? 'No data found!' : type === 'noDataFound' ? `No results found!` : `You don't have any ${type}`}</p>
  </div>
);

export default EmptyList;
