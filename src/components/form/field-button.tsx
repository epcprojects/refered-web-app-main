import { Button, ButtonProps } from '@/components/ui/button';
import { FieldValues, UseFormReturn } from 'react-hook-form';

interface ICommonProps<T extends FieldValues> extends Omit<ButtonProps, 'form' | 'children' | 'asChild'> {
  form: UseFormReturn<T>;
  leftElement?: string | React.ReactNode;
  rightElement?: string | React.ReactNode;
}

interface ILabelProps {
  label: string;
  children?: never;
}

interface IChildrenProps {
  label?: never;
  children: React.ReactNode;
}

type IProps<T extends FieldValues> = (ILabelProps | IChildrenProps) & ICommonProps<T>;

function FieldButton<T extends FieldValues>({ form, type, isLoading, disabled, classes, ...buttonProps }: IProps<T>) {
  return <Button type={type} isLoading={isLoading || (type === 'submit' && form.formState.isSubmitting)} disabled={disabled || form.formState.isSubmitting} classes={classes as any} {...buttonProps} />;
}

export default FieldButton;
