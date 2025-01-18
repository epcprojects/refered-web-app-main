import { Input, InputProps } from '@/components/ui/input';
import { startCase } from '@/utils/lodash.utils';
import { FieldError, FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { FormField, IFormFieldProps } from '.';

interface IProps<T extends FieldValues> extends Omit<InputProps, 'form'>, Pick<IFormFieldProps<T>, 'labelConfig' | 'descriptionConfig' | 'errorConfig'> {
  form: UseFormReturn<T>;
  name: Path<T>;
  classes?: { container?: string };
}

function FieldInput<T extends FieldValues>({ form, name, placeholder, labelConfig, descriptionConfig, errorConfig, classes, ...inputProps }: IProps<T>) {
  return (
    <FormField form={form} register={form.register(name)} labelConfig={{ hideLabel: true, ...labelConfig }} descriptionConfig={descriptionConfig} errorConfig={errorConfig} className={classes?.container}>
      {(field) => <Input error={form.formState.errors[name] as FieldError} placeholder={placeholder || startCase(name)} {...field} {...inputProps} />}
    </FormField>
  );
}

export default FieldInput;
