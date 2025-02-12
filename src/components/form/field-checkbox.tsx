import { InputProps } from '@/components/ui/input';
import { CheckboxProps } from '@radix-ui/react-checkbox';
import { CheckIcon } from '@radix-ui/react-icons';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { FormField, IFormFieldProps } from '.';
import { Checkbox, CheckboxIndicator } from '../ui/checkbox';

interface IProps<T extends FieldValues> extends Omit<InputProps, 'form' | 'checked'>, Pick<IFormFieldProps<T>, 'labelConfig' | 'descriptionConfig' | 'errorConfig'>, Pick<CheckboxProps, 'onCheckedChange' | 'checked'> {
  form: UseFormReturn<T>;
  name: Path<T>;
  classes?: { container?: string };
}

function FieldCheckbox<T extends FieldValues>({ form, name, placeholder, labelConfig, descriptionConfig, errorConfig, classes, onCheckedChange, checked, ...inputProps }: IProps<T>) {
  return (
    <FormField form={form} register={form.register(name)} labelConfig={{ hideLabel: true, ...labelConfig }} descriptionConfig={descriptionConfig} errorConfig={errorConfig} className={classes?.container}>
      {(field) => (
        <div className="flex items-center gap-2">
          <Checkbox className="CheckboxRoot" id="c1" onCheckedChange={onCheckedChange} checked={checked}>
            <CheckboxIndicator className="CheckboxIndicator">
              <CheckIcon width={20} height={20} color="white" />
            </CheckboxIndicator>
          </Checkbox>
          <label className="Label" htmlFor="c1">
            {labelConfig?.value}
          </label>
        </div>
      )}
    </FormField>
  );
}

export default FieldCheckbox;
