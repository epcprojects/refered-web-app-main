import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp';
import React, { useMemo } from 'react';
import { FieldError, FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { FormField } from '.';

interface IProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  length: number[];
}

function FieldOtp<T extends FieldValues>({ form, name, length }: IProps<T>) {
  const maxLength = useMemo(() => length.reduce((acc, curr) => acc + curr, 0), [length]);

  return (
    <FormField form={form} register={form.register(name)} labelConfig={{ hideLabel: true }} errorConfig={{ className: '-bottom-[1.3rem]' }}>
      {(field) => (
        <InputOTP maxLength={maxLength} {...field}>
          {length.map((group, groupIndex) => {
            const prevIndex = length.slice(0, groupIndex).reduce((acc, curr) => acc + curr, 0) || 0;
            return (
              <React.Fragment key={groupIndex}>
                {groupIndex === 0 ? null : <InputOTPSeparator />}
                <InputOTPGroup className="gap-2.5">
                  {Array.from({ length: group }, (_, index) => index + prevIndex).map((item) => (
                    <InputOTPSlot key={item} index={item} error={form.formState.errors[name] as FieldError} />
                  ))}
                </InputOTPGroup>
              </React.Fragment>
            );
          })}
        </InputOTP>
      )}
    </FormField>
  );
}

export default FieldOtp;
