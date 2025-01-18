'use client';

import { AppTheme } from '@/constants/app-theme.constants';
import { ThemeProvider } from 'next-themes';
import React, { useEffect, useState } from 'react';

interface IProps {
  children: React.ReactNode;
}

const AppThemeProvider: React.FC<IProps> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return (
    <ThemeProvider attribute="class" defaultTheme={AppTheme.light} enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
};

export default AppThemeProvider;
