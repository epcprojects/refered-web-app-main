import Image from 'next/image';
import React from 'react';

interface IProps {
  coverImageSrc: string;
  children: React.ReactNode;
  notForAuthPage?: boolean;
}

const AuthPageLayout: React.FC<IProps> = ({ coverImageSrc, children, notForAuthPage }) => {
  return (
    <>
      <div className="min-h-full flex-1 lg:max-w-[50vw]">{children}</div>
      {notForAuthPage ? null : (
        <div className="fixed right-0 top-0 hidden h-screen max-h-screen min-h-screen w-[50vw] lg:block">
          <div className="relative hidden min-h-full bg-primary lg:block">
            <Image src={coverImageSrc} alt="cover" fill className="object-cover" priority />
          </div>
        </div>
      )}
    </>
  );
};

export default AuthPageLayout;
