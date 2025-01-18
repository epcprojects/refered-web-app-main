import { PasswordInput, PasswordInputProps } from '@/components/ui/password-input';
import { startCase } from '@/utils/lodash.utils';
import { FieldError, FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { FormField, IFormFieldProps } from '.';

interface IProps<T extends FieldValues> extends Omit<PasswordInputProps, 'form'>, Pick<IFormFieldProps<T>, 'errorConfig'> {
  form: UseFormReturn<T>;
  name: Path<T>;
  showForgotPassword?: boolean;
}

function FieldPasswordInput<T extends FieldValues>({ form, name, showForgotPassword, placeholder, errorConfig, ...passwordInputProps }: IProps<T>) {
  return (
    <FormField form={form} register={form.register(name)} labelConfig={{ hideLabel: true }} errorConfig={errorConfig}>
      {(field) => <PasswordInput error={form.formState.errors[name] as FieldError} placeholder={placeholder || startCase(name)} {...field} {...passwordInputProps} />}
    </FormField>
  );
}

export default FieldPasswordInput;
