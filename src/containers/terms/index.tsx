'use client';

import AuthCardLayout from '@/components/layout/auth-card-layout';
import React from 'react';

interface IProps {}

const TermsIndex: React.FC<IProps> = () => {
  return (
    <AuthCardLayout title="Terms" coverImageSrc="/images/auth-cover-01.jpg">
      Lorem Ipsum Dolor
    </AuthCardLayout>
  );
};

export default TermsIndex;
