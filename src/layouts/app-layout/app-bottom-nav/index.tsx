import React from 'react';
import AppNavigation from './app-navigation';

interface IProps {}

const AppBottomNav: React.FC<IProps> = () => {
  return (
    <div className="fixed bottom-0 block h-bottomNav w-full border-t-1 border-border bg-card md:hidden">
      <AppNavigation isBottomNav className="mt-0.5 w-full" />
    </div>
  );
};

export default AppBottomNav;
