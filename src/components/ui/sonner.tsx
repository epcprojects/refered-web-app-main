'use client';

import { useAppResponsive } from '@/hooks/use-app-responsive';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { under } = useAppResponsive();
  const { theme } = useAppTheme();

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      visibleToasts={5}
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: 'group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          // info: 'group toast group-[.toaster]:!bg-info group-[.toaster]:!text-info-foreground group-[.toaster]:shadow-lg',
          // success: 'group toast group-[.toaster]:!bg-success group-[.toaster]:!text-success-foreground group-[.toast]:tex!t-success-foreground group-[.toaster]:shadow-lg',
          // warning: 'group toast group-[.toaster]:!bg-warning group-[.toaster]:!text-warning-foreground group-[.toast]:tex!t-warning-foreground group-[.toaster]:shadow-lg',
          // error: 'group toast group-[.toaster]:!bg-destructive group-[.toaster]:!text-destructive-foreground group-[.toast]:text-de!structive-foreground group-[.toaster]:shadow-lg',
          // icon: 'h-full self-start flex items-start',
        },
        // descriptionClassName: 'group-data-[type=info]:text-info-foreground/70 group-data-[type=success]:text-success-foreground/70 group-data-[type=warning]:text-warning-foreground/70 group-data-[type=error]:text-destructive-foreground/70',
      }}
      {...props}
    />
  );
};

export { Toaster };
