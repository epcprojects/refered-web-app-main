'use client';

import React from 'react';

interface IProps {
  children: React.ReactNode;
}

const AuthLayoutIndex: React.FC<IProps> = ({ children }) => {
  return <main className="flex h-full min-h-page w-full flex-row bg-card">{children}</main>;
};

export default AuthLayoutIndex;
