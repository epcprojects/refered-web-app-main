'use client';

import { Button } from '@/components/ui/button';
import { Input, type InputProps } from '@/components/ui/input';
import { cn } from '@/utils/cn.utils';
import * as React from 'react';
import { LuEye, LuEyeOff } from 'react-icons/lu';

export interface PasswordInputProps extends InputProps {}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(({ className, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="relative">
      <Input type={showPassword ? 'text' : 'password'} className={cn('hide-password-toggle pr-10', className)} ref={ref} noErrorIcon {...props} />
      <Button type="button" variant="ghost" size="sm" classes={{ container: 'absolute right-0 top-0 h-full px-3 py-2 opacity-50 transition-opacity hover:bg-transparent hover:opacity-100' }} onClick={() => setShowPassword((prev) => !prev)} disabled={props.disabled}>
        {showPassword && !props.disabled ? <LuEye className="h-4 w-4" aria-hidden="true" /> : <LuEyeOff className="h-4 w-4" aria-hidden="true" />}
        <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
      </Button>

      {/* hides browsers password toggles */}
      <style>{`
					.hide-password-toggle::-ms-reveal,
					.hide-password-toggle::-ms-clear {
						visibility: hidden;
						pointer-events: none;
						display: none;
					}
				`}</style>
    </div>
  );
});
PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
