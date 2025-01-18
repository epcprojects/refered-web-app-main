import { TooltipProvider } from '@/components/ui/tooltip';
import React from 'react';

interface IProps {
  children: React.ReactNode;
}

const AppTooltipProvider: React.FC<IProps> = ({ children }) => {
  return <TooltipProvider>{children}</TooltipProvider>;
};

export default AppTooltipProvider;
