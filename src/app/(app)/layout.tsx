import AppLayoutIndex from '@/layouts/app-layout';
import React from 'react';

interface IProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<IProps> = ({ children }) => <AppLayoutIndex>{children}</AppLayoutIndex>;
export default AppLayout;
