'use client';

import { cn } from '@/utils/cn.utils';
import { VariantProps, cva } from 'class-variance-authority';
import React from 'react';
import { LuLoader } from 'react-icons/lu';

interface IProps extends VariantProps<typeof spinnerVariants> {
  size?: 'sm' | 'md' | 'lg' | string;
  className?: string;
  containerClassName?: string;
}

const spinnerVariants = cva('', {
  defaultVariants: { container: 'default', color: 'default' },
  variants: {
    container: {
      default: '',
      fullWidth: 'w-full max-w-[100dvw] flex items-center justify-center py-10',
    },
    color: {
      default: 'text-inherit',
      primary: 'text-primary',
      secondary: 'text-secondary',
      'primary-foreground': 'text-primary-foreground',
      'secondary-foreground': 'text-secondary-foreground',
    },
  },
});

const sizes = {
  sm: '16',
  md: '50',
  lg: '100',
};

const Spinner: React.FC<IProps> = ({ size = 'sm', className, containerClassName, container, color }) => (
  <span className={cn(spinnerVariants({ container }), containerClassName)}>
    <LuLoader size={['sm', 'md', 'lg'].includes(size) ? sizes[size as keyof typeof sizes] : size} className={cn('animate-spin', spinnerVariants({ color }), className)} />
  </span>
);
Spinner.displayName = 'Spinner';
export { Spinner };
