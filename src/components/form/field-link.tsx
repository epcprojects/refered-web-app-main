import Link, { LinkProps } from '@/components/ui/link';
import { FieldValues, UseFormReturn } from 'react-hook-form';

interface ICommonProps<T extends FieldValues> extends Omit<LinkProps, 'form' | 'label' | 'children'> {
  form: UseFormReturn<T>;
  href: string;
  disabled?: boolean;
  leftElement?: string | React.ReactNode;
  rightElement?: string | React.ReactNode;
  isLoading?: boolean;
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

function FieldLink<T extends FieldValues>({ form, disabled, ...LinkProps }: IProps<T>) {
  return <Link disabled={disabled || form.formState.isSubmitting} {...LinkProps} />;
}

export default FieldLink;
