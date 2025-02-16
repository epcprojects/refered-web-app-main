'use client';

import { Form } from '@/components/form';
import FieldButton from '@/components/form/field-button';
import FieldInput from '@/components/form/field-input';
import AuthCardLayout from '@/components/layout/auth-card-layout';
import Link from '@/components/ui/link';
import { AppPages } from '@/constants/app-pages.constants';
import { ForgotPassword, handleDeformatPhoneNumberForAPI } from '@/firebase/auth';
import { asyncGuard } from '@/utils/lodash.utils';
import { ZOD } from '@/utils/zod.utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useForm } from 'react-hook-form';
import { LuChevronLeft } from 'react-icons/lu';
import { toast } from 'sonner';
import { z } from 'zod';

interface IProps {}

export type forgotPasswordFormSchemaType = z.infer<typeof forgotPasswordFormSchema>;
export const forgotPasswordFormSchema = z.object({
  phoneNumber: z.string({ required_error: ZOD.ERROR.REQUIRED() }).min(10, { message: ZOD.ERROR.REQUIRED() }),
});

const ForgotPasswordIndex: React.FC<IProps> = () => {
  const router = useRouter();

  const form = useForm<forgotPasswordFormSchemaType>({ resolver: zodResolver(forgotPasswordFormSchema) });

  const onSubmit = async (values: forgotPasswordFormSchemaType) => {
    const response = await asyncGuard(() => ForgotPassword({ PhoneNo: values.phoneNumber || '' }));
    if (response.error !== null || response.result === null) toast.error(response.error?.toString() || 'Something went wrong!');
    else router.push(`${AppPages.VERIFICATION}?type=resetPassword&phone=${handleDeformatPhoneNumberForAPI(values.phoneNumber || '')}`);
  };

  return (
    <AuthCardLayout title="Forgot your Password" coverImageSrc="/images/auth-cover-02.jpg">
      <Form form={form} onSubmit={onSubmit} className="grid w-full gap-2.5">
        <FieldInput form={form} name="phoneNumber" mask={Mask.USA} placeholder="Phone Number" />
        <FieldButton form={form} type="submit" classes={{ container: 'w-full' }} label="Submit" variant="secondary" />
      </Form>
      <Link href={AppPages.SIGNIN} label="Back to Login" classes={{ container: 'group mt-2 text-sm gap-0.5' }} leftElement={<LuChevronLeft className="transition-all group-hover:-translate-x-1" />} />
    </AuthCardLayout>
  );
};

export default ForgotPasswordIndex;
