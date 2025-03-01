import { cn } from '@/utils/cn.utils';
import * as RadixSelect from '@radix-ui/react-select';
import React from 'react';
import { FieldError } from 'react-hook-form';
import { FaChevronDown } from 'react-icons/fa';

export interface SelectProps {
  error?: FieldError | string;
  noErrorIcon?: boolean;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  containerClassName?: string;
  options: { label: string; value: string }[];
  placeholder?: string;
  value?: string | null;
  onChange?: (value: string) => void;
}

const Select: React.FC<SelectProps> = ({ containerClassName, error, leftElement, rightElement, options, placeholder, onChange, value }) => {
  return (
    <RadixSelect.Root value={value || ''} onValueChange={onChange}>
      <RadixSelect.Trigger className={cn('relative flex h-9 w-full items-center justify-between gap-2 rounded-md border border-transparent bg-background px-3 text-sm focus:ring-2', error && '!border-destructive focus:ring-destructive', containerClassName)}>
        {!!leftElement && leftElement}
        <RadixSelect.Value placeholder={placeholder} className={cn('w-full bg-transparent text-sm', !value && 'text-gray-400')} />
        <RadixSelect.Icon>
          <FaChevronDown size={14} className="ml-auto text-gray-500" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content className="z-[1000] w-full overflow-hidden rounded-md border border-gray-200 bg-white text-sm shadow-md">
          <RadixSelect.Viewport>
            {options.map((option) => (
              <RadixSelect.Item key={option.value} value={option.value} className="cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 data-[state=checked]:bg-gray-200">
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
};

export { Select };
