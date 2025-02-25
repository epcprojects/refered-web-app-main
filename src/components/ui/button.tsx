import { cn } from '@/utils/cn.utils';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Spinner } from './spinner';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

const buttonVariants = cva('inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0', {
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
      destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
      outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
      secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
      plain: '',
      border: 'border-1 border-border',
      background: 'bg-background text-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      'link/primary': 'text-primary !h-max !p-0',
      'link/secondary': 'text-secondary !h-max !p-0',
      'link/info': 'text-info !h-max !p-0',
    },
    size: {
      default: 'h-9 px-4 py-2',
      sm: 'h-8 rounded-md px-3 text-xs',
      lg: 'h-10 rounded-md px-8',
      icon: 'h-9 w-9',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

interface ICommonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'>, VariantProps<typeof buttonVariants> {
  tooltip?: string | React.ReactNode;
}

interface IAsChildProps {
  label?: never;
  classes?: { container?: string; label?: never };
  isLoading?: never;
  leftElement?: never;
  rightElement?: never;
  asChild: true;
  children: React.ReactNode;
}

interface ILabelProps {
  label: string;
  classes?: { container?: string; label?: string };
  isLoading?: boolean;
  leftElement?: string | React.ReactNode;
  rightElement?: string | React.ReactNode;
  asChild?: never;
  children?: never;
}

interface IChildrenProps {
  label?: never;
  classes?: { container?: string; label?: never };
  isLoading?: boolean;
  leftElement?: string | React.ReactNode;
  rightElement?: string | React.ReactNode;
  asChild?: never;
  children: React.ReactNode;
}

export type ButtonProps = (IAsChildProps | ILabelProps | IChildrenProps) & ICommonProps;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ variant, size, asChild = false, tooltip, classes, ...props }, ref) => {
  let comp: React.ReactNode = <></>;

  if (asChild) comp = <Slot className={cn(buttonVariants({ variant, size, className: classes?.container }))} ref={ref} {...props} />;
  else {
    const { disabled, children, isLoading, label, leftElement, rightElement } = props;
    comp = (
      <button className={cn(buttonVariants({ variant, size, className: classes?.container }))} ref={ref} disabled={disabled || isLoading} {...props}>
        {isLoading ? <Spinner /> : leftElement}
        {!!children ? children : <span className={cn(!!leftElement || !!rightElement ? 'sr-only md:not-sr-only' : '', classes?.label)}>{label}</span>}
        {rightElement}
      </button>
    );
  }

  if (!tooltip) return comp;

  const [open, setOpen] = React.useState(false);

  return (
    <Tooltip open={open} delayDuration={0} onOpenChange={setOpen}>
      <TooltipTrigger asChild onClick={() => setOpen(true)}>
        {comp}
      </TooltipTrigger>
      <TooltipContent className="Tooltip">{tooltip}</TooltipContent>
    </Tooltip>
  );
});
Button.displayName = 'Button';

export { Button, buttonVariants };
