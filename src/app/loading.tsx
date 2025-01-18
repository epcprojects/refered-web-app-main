import Image from 'next/image';
import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Image src="/images/logo.png" alt="Logo" width={60} height={60} className="animate-page-loader" />
    </div>
  );
};

export default Loading;
