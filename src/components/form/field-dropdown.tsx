import { Select, SelectProps } from '@/components/ui/select-dropdown';
import { FieldError, FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { FormField, IFormFieldProps } from '.';

interface IProps<T extends FieldValues> extends Omit<SelectProps, 'form'>, Pick<IFormFieldProps<T>, 'labelConfig' | 'descriptionConfig' | 'errorConfig'> {
  form: UseFormReturn<T>;
  name: Path<T>;
  classes?: { container?: string };
}

function FieldSelectDropdown<T extends FieldValues>({ form, name, labelConfig, descriptionConfig, errorConfig, classes, ...inputProps }: IProps<T>) {
  return (
    <FormField form={form} register={form.register(name)} labelConfig={{ hideLabel: true, ...labelConfig }} descriptionConfig={descriptionConfig} errorConfig={errorConfig} className={classes?.container}>
      {(field) => <Select error={form.formState.errors[name] as FieldError} {...field} {...inputProps} />}
    </FormField>
  );
}

export default FieldSelectDropdown;
