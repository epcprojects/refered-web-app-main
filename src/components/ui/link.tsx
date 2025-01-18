import { cn } from '@/utils/cn.utils';
import React from 'react';
import { Button, ButtonProps } from './button';
// eslint-disable-next-line no-restricted-imports
import NextLink from 'next/link';
import { Spinner } from './spinner';

interface ICommonProps extends Pick<ButtonProps, 'variant' | 'size' | 'style'> {
  href: string;
  classes?: { container?: string; label?: string };
  disabled?: boolean;
  leftElement?: string | React.ReactNode;
  rightElement?: string | React.ReactNode;
  isLoading?: boolean;
  type?: 'dropdown-menu-button';
  target?: React.HTMLAttributeAnchorTarget;
}

interface ILabelProps {
  label: string;
  children?: never;
}

interface IChildrenProps {
  label?: never;
  children: React.ReactNode;
}

export type LinkProps = (ILabelProps | IChildrenProps) & ICommonProps;

const dropdownMenuButtonClasses = 'w-full justify-start !px-2 !py-1.5 font-normal text-inherit';

const Link: React.FC<LinkProps> = ({ href, label, children, disabled, variant, classes, leftElement, rightElement, isLoading, type, target, ...buttonProps }) => {
  return (
    <Button asChild variant={variant || 'link/secondary'} classes={{ container: cn(disabled && 'pointer-events-none opacity-50', type === 'dropdown-menu-button' && dropdownMenuButtonClasses, classes?.container) }} {...buttonProps}>
      <NextLink href={href} target={target} className={classes?.label}>
        {isLoading ? <Spinner /> : leftElement}
        <span className={classes?.label}>{label || children}</span>
        {rightElement}
      </NextLink>
    </Button>
  );
};

export default Link;
