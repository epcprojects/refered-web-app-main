'use client';

import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import AppTooltipProvider from '@/providers/app-tooltip.provider';
import { cn } from '@/utils/cn.utils';
import { startCase } from '@/utils/lodash.utils';
import * as LabelPrimitive from '@radix-ui/react-label';
import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';
import { Controller, ControllerProps, ControllerRenderProps, FieldPath, FieldValues, FormProvider, SubmitErrorHandler, SubmitHandler, useFormContext, UseFormRegisterReturn, UseFormReturn } from 'react-hook-form';
import { LuInfo } from 'react-icons/lu';

// useFormField
const useFormField = () => {
  const fieldContext = React.useContext(FormFieldPrimitiveContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) throw new Error('useFormField should be used within <FormField>');
  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

// FormFieldPrimitive
type FormFieldPrimitiveContextValue<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = { name: TName };
const FormFieldPrimitiveContext = React.createContext<FormFieldPrimitiveContextValue>({} as FormFieldPrimitiveContextValue);
const FormFieldPrimitive = <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({ ...props }: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldPrimitiveContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldPrimitiveContext.Provider>
  );
};

// FormItem
type FormItemContextValue = { id: string };
const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);
const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn('relative mb-2', className)} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = 'FormItem';

// FormLabel
const FormLabel = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>>(({ className, ...props }, ref) => {
  const { formItemId } = useFormField();
  return <Label ref={ref} className={cn(className)} htmlFor={formItemId} {...props} />;
});
FormLabel.displayName = 'FormLabel';

// FormControl
const FormControl = React.forwardRef<React.ElementRef<typeof Slot>, React.ComponentPropsWithoutRef<typeof Slot>>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
  return <Slot ref={ref} id={formItemId} aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`} aria-invalid={!!error} {...props} />;
});
FormControl.displayName = 'FormControl';

// FormDescription
const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();
  return <p ref={ref} id={formDescriptionId} className={cn('text-[0.8rem] text-muted-foreground', className)} {...props} />;
});
FormDescription.displayName = 'FormDescription';

// FormMessage
const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message) : children;

  if (!body) return null;
  return (
    <p ref={ref} id={formMessageId} className={cn('absolute -bottom-[1.05rem] text-[0.7rem] text-destructive', className)} {...props}>
      {body}
    </p>
  );
});
FormMessage.displayName = 'FormMessage';

// Form
interface IFormProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  children: React.ReactNode;
  className?: string;
  onSubmit?: SubmitHandler<T>;
  onInvalid?: SubmitErrorHandler<T> | undefined;
}
function Form<T extends FieldValues>({ form, onSubmit = () => {}, onInvalid, className, children }: IFormProps<T>) {
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className={className}>
        {children}
      </form>
    </FormProvider>
  );
}

// FormField
export interface IFormFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  register: UseFormRegisterReturn;
  className?: string;
  labelConfig?: { containerClassName?: string; className?: string; hideLabelAndPersistLabelLayout?: boolean; value?: string | React.ReactNode; tooltip?: string; children?: () => React.ReactNode; hideLabel?: boolean; isOptional?: boolean; showBesideChild?: boolean };
  errorConfig?: { className?: string; showErrorMsgBelowLabel?: boolean; disableErrorMsg?: boolean };
  descriptionConfig?: { className?: string; value?: string; showBelowLabel?: boolean };
  children: (field: ControllerRenderProps<FieldValues, string>) => React.ReactNode;
}
function FormField<T extends FieldValues>({ form, register, className, labelConfig, errorConfig, descriptionConfig, children }: IFormFieldProps<T>) {
  return (
    <FormFieldPrimitive
      {...register}
      render={({ field }) => (
        <FormItem className={cn(className)}>
          <div className="flex flex-row gap-4">
            {labelConfig?.showBesideChild ? <FormControl>{children(field)}</FormControl> : null}
            {labelConfig?.hideLabel ? null : (
              <div className={cn('mb-2', labelConfig?.containerClassName)}>
                <div className="flex flex-col gap-1">
                  <div className={cn('flex items-center gap-1', labelConfig?.hideLabelAndPersistLabelLayout && 'pointer-events-none opacity-0')}>
                    <FormLabel className={cn(labelConfig?.className)}>
                      <span>{labelConfig?.value || startCase(field.name)}</span>
                      {!labelConfig?.isOptional ? null : <span className={cn('ml-1 text-xs leading-none text-muted-foreground/60')}>(optional)</span>}
                    </FormLabel>
                    {labelConfig?.tooltip === undefined ? null : (
                      <AppTooltipProvider>
                        <Tooltip delayDuration={200}>
                          <TooltipTrigger>
                            <LuInfo className="h-[0.8rem] w-[0.8rem] text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-[20rem]">
                            <p className="text-center text-xs">{labelConfig.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </AppTooltipProvider>
                    )}
                  </div>
                  {!!descriptionConfig && descriptionConfig.showBelowLabel ? <FormDescription className={descriptionConfig?.className}>{descriptionConfig?.value}</FormDescription> : null}
                  {errorConfig?.showErrorMsgBelowLabel && !errorConfig.disableErrorMsg ? <FormMessage className={errorConfig?.className} /> : null}
                </div>
                {labelConfig?.children?.()}
              </div>
            )}
          </div>
          {!labelConfig?.showBesideChild ? <FormControl className="mb-1">{children(field)}</FormControl> : null}
          {!!descriptionConfig && !descriptionConfig.showBelowLabel ? <FormDescription className={descriptionConfig?.className}>{descriptionConfig?.value}</FormDescription> : null}
          {!errorConfig?.showErrorMsgBelowLabel && !errorConfig?.disableErrorMsg ? <FormMessage className={errorConfig?.className} /> : null}
        </FormItem>
      )}
    />
  );
}

export { Form, FormField, FormLabel };
