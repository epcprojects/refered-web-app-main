import { Select, SelectProps } from '@/components/ui/select-dropdown';
import { Controller, FieldError, FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { FormField, IFormFieldProps } from '.';

interface IProps<T extends FieldValues> extends Omit<SelectProps, 'form'>, Pick<IFormFieldProps<T>, 'labelConfig' | 'descriptionConfig' | 'errorConfig'> {
  form: UseFormReturn<T>;
  name: Path<T>;
  classes?: { container?: string };
}

function FieldSelectDropdown<T extends FieldValues>({ form, name, labelConfig, descriptionConfig, errorConfig, classes, ...inputProps }: IProps<T>) {
  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field }) => (
        <FormField form={form} register={form.register(name)} labelConfig={{ hideLabel: true, ...labelConfig }} descriptionConfig={descriptionConfig} errorConfig={errorConfig} className={classes?.container}>
          {() => <Select value={field.value || ''} onChange={field.onChange} error={form.formState.errors[name] as FieldError} {...inputProps} />}
        </FormField>
      )}
    />
  );
}

export default FieldSelectDropdown;
