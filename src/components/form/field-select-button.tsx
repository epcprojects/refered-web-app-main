import { cn } from '@/utils/cn.utils';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { LuChevronRight } from 'react-icons/lu';
import FieldButton from './field-button';

interface IProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  placeholder?: string;
  onClick?: () => void;
  className?: string;
}

function FieldSelectButton<T extends FieldValues>({ form, name, placeholder = 'Select', className, onClick }: IProps<T>) {
  const watch = form.watch(name);
  const error = form.formState.errors[name];

  return (
    <div className="relative">
      <FieldButton form={form} variant="background" type="button" label={watch || placeholder} classes={{ container: cn('w-full group justify-between border-1 border-transparent', !!error && 'border-destructive', className), label: cn('font-normal !not-sr-only', !!watch === false && 'text-[#AEB3BD]') }} rightElement={<LuChevronRight size={10} className="transition-all group-hover:translate-x-1" />} onClick={onClick} />
      {!!error ? <p className={cn('absolute -bottom-[0.55rem] text-[0.7rem] text-destructive')}>{error.message?.toString()}</p> : null}
    </div>
  );
}

export default FieldSelectButton;
