'use client';

import AuthCardLayout from '@/components/layout/auth-card-layout';
import React from 'react';

interface IProps {}

const DataPolicyIndex: React.FC<IProps> = () => {
  return (
    <AuthCardLayout title="Data Policy" coverImageSrc="/images/auth-cover-01.jpg">
      Lorem Ipsum Dolor
    </AuthCardLayout>
  );
};

export default DataPolicyIndex;
