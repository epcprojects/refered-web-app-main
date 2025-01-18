import { Textarea, TextareaProps } from '@/components/ui/textarea';
import { startCase } from '@/utils/lodash.utils';
import { FieldError, FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { FormField, IFormFieldProps } from '.';

interface IProps<T extends FieldValues> extends Omit<TextareaProps, 'form'>, Pick<IFormFieldProps<T>, 'labelConfig' | 'descriptionConfig' | 'errorConfig'> {
  form: UseFormReturn<T>;
  name: Path<T>;
  classes?: { container?: string };
}

function FieldTextarea<T extends FieldValues>({ form, name, placeholder, labelConfig, descriptionConfig, errorConfig, classes, ...textareaProps }: IProps<T>) {
  return (
    <FormField form={form} register={form.register(name)} labelConfig={{ hideLabel: true, ...labelConfig }} descriptionConfig={descriptionConfig} errorConfig={errorConfig} className={classes?.container}>
      {(field) => <Textarea error={form.formState.errors[name] as FieldError} placeholder={placeholder || startCase(name)} {...field} {...textareaProps} />}
    </FormField>
  );
}

export default FieldTextarea;
