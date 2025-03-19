import { cn } from '@/utils/cn.utils';
import React, { useEffect, useRef } from 'react';
import { FieldError } from 'react-hook-form';
import { RiErrorWarningFill } from 'react-icons/ri';
import { IMaskInput } from 'react-imask';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: FieldError | string;
  noErrorIcon?: boolean;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  mask?: string;
  containerClassName?: string;
}

const InputStyles = {
  base: (hasError: boolean, isDisabled: boolean) => cn('flex cursor-text items-center gap-2 w-full rounded-md h-9 px-3 border-1 focus-within:border-secondary bg-background border-transparent', hasError && '!border-destructive focus-visible:ring-0', isDisabled && 'opacity-50 pointer-events-none'),
  input: 'peer bg-transparent w-full p-0 !m-0 placeholder:opacity-80 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed',
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ 
  containerClassName, 
  error, 
  noErrorIcon = false, 
  leftElement, 
  rightElement, 
  type, 
  mask,
  formAction, 
  contentEditable, 
  children, 
  className, 
  onChange, 
  value, 
  ...props 
}, ref) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleRef = (inputElement: HTMLInputElement | null) => {
    inputRef.current = inputElement;
    if (typeof ref === 'function') ref(inputElement);
    else if (ref && typeof ref === 'object') ref.current = inputElement;
  };

  useEffect(() => {
    if (mask && inputRef.current) {
      const handleAutofill = () => {
        const input = inputRef.current;
        if (input && input.matches(':-webkit-autofill')) {
          const event = new Event('input', { bubbles: true });
          input.dispatchEvent(event);
        }
      };

      // Check for autofill after a short delay to allow browser to complete autofill
      const timeoutId = setTimeout(handleAutofill, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [mask]);

  return (
    <div className={cn(InputStyles.base(!!error, !!props.disabled), containerClassName)} onClick={() => inputRef.current?.focus()}>
      {!!leftElement && leftElement}
      {!!mask ? (
        <IMaskInput
          type={type}
          className={cn(InputStyles.input, className)}
          inputRef={handleRef}
          mask={mask.replace(/9/g, '0')}
          value={value?.toString()}
          onChange={onChange}
          {...props}
        />
      ) : (
        <input
          type={type}
          className={cn(InputStyles.input, className)}
          ref={handleRef}
          onChange={onChange}
          value={value}
          {...{ formAction, contentEditable, children, ...props }}
        />
      )}
      {!!rightElement ? rightElement : !!error && noErrorIcon === false ? <RiErrorWarningFill size={20} className="flex-shrink-0 self-center text-destructive" /> : null}
    </div>
  );
});

Input.displayName = 'Input';
export { Input };

