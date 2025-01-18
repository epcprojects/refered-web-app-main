'use client';

import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import PhoneInputWithCountry from 'react-phone-number-input/react-hook-form';
import 'react-phone-number-input/style.css';
import { FormField } from '.';

interface IProps<T extends FieldValues> {
  form: UseFormReturn<T, any, undefined>;
  name: Path<T>;
  placeholder?: string;
}

function FieldPhoneNumberNew<T extends FieldValues>({ form, name, placeholder }: IProps<T>) {
  return (
    <FormField form={form} register={form.register(name)} labelConfig={{ hideLabel: true }} errorConfig={{ className: '-bottom-[1rem]' }}>
      {(field) => <PhoneInputWithCountry international containerComponentProps={{ 'data-error': Boolean(form.formState.errors[name]) }} name={name} placeholder={placeholder} value={field.value} onChange={field.onChange} defaultCountry="US" />}
    </FormField>
  );
}

export default FieldPhoneNumberNew;
