'use client';

import AuthCardLayout from '@/components/layout/auth-card-layout';
import React from 'react';

interface IProps {}

const CookiePolicyIndex: React.FC<IProps> = () => {
  return (
    <AuthCardLayout title="Cookie Policy" coverImageSrc="/images/auth-cover-01.jpg">
      Lorem Ipsum Dolor
    </AuthCardLayout>
  );
};

export default CookiePolicyIndex;
