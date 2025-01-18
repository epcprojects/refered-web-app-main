import { cn } from '@/utils/cn.utils';
import * as React from 'react';
import { FieldError } from 'react-hook-form';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: FieldError | undefined;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, error, ...props }, ref) => {
  return <textarea className={cn('!mb-0 flex h-20 min-h-9 w-full rounded-md border-1 border-transparent bg-background px-3 py-1.5 text-sm shadow-sm transition-colors placeholder:opacity-80 focus-within:border-secondary focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50', !!error && 'border-destructive focus-visible:ring-0', className)} ref={ref} {...props} />;
});
Textarea.displayName = 'Textarea';

export { Textarea };
