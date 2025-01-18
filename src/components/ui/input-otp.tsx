'use client';

import { cn } from '@/utils/cn.utils';
import { OTPInput, OTPInputContext } from 'input-otp';
import * as React from 'react';
import { FieldError } from 'react-hook-form';
import { RxDash } from 'react-icons/rx';

const InputOTP = React.forwardRef<React.ElementRef<typeof OTPInput>, React.ComponentPropsWithoutRef<typeof OTPInput>>(({ className, containerClassName, ...props }, ref) => <OTPInput ref={ref} containerClassName={cn('flex items-center gap-2 has-[:disabled]:opacity-50', containerClassName)} className={cn('disabled:cursor-not-allowed', className)} {...props} />);
InputOTP.displayName = 'InputOTP';

const InputOTPGroup = React.forwardRef<React.ElementRef<'div'>, React.ComponentPropsWithoutRef<'div'>>(({ className, ...props }, ref) => <div ref={ref} className={cn('flex items-center', className)} {...props} />);
InputOTPGroup.displayName = 'InputOTPGroup';

const InputOTPSlot = React.forwardRef<React.ElementRef<'div'>, React.ComponentPropsWithoutRef<'div'> & { index: number; error?: FieldError | undefined }>(({ index, className, error, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];

  return (
    <div ref={ref} className={cn('group relative flex h-9 w-9 items-center justify-center rounded-md bg-background text-sm shadow-sm transition-all', isActive && 'z-10 ring-1 ring-ring', !!error && 'border-destructive ring-0', className)} {...props}>
      <span>{char || '-'}</span>
      {/* {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink h-4 w-px bg-foreground duration-1000" />
        </div>
      )} */}
    </div>
  );
});
InputOTPSlot.displayName = 'InputOTPSlot';

const InputOTPSeparator = React.forwardRef<React.ElementRef<'div'>, React.ComponentPropsWithoutRef<'div'>>(({ ...props }, ref) => (
  <div ref={ref} role="separator" className="text-muted-foreground/50" {...props}>
    <RxDash />
  </div>
));
InputOTPSeparator.displayName = 'InputOTPSeparator';

export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot };
