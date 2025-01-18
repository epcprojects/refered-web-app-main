import AuthLayoutIndex from '@/layouts/auth-layout';
import React from 'react';

interface IProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<IProps> = ({ children }) => <AuthLayoutIndex>{children}</AuthLayoutIndex>;
export default AuthLayout;
