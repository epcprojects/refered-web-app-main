'use client';

import { Form } from '@/components/form';
import FieldButton from '@/components/form/field-button';
import FieldInput from '@/components/form/field-input';
import FieldLink from '@/components/form/field-link';
import FieldPasswordInput from '@/components/form/field-password-input';
import AuthCardLayout from '@/components/layout/auth-card-layout';
import Link from '@/components/ui/link';
import { AppPages } from '@/constants/app-pages.constants';
import { handleDeformatPhoneNumberForAPI, Signin, Signout } from '@/firebase/auth';
import { useAppStore } from '@/hooks/use-app-store';
import { asyncGuard } from '@/utils/lodash.utils';
import { ZOD } from '@/utils/zod.utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useForm } from 'react-hook-form';
import { formatPhoneNumber } from 'react-phone-number-input';
import { toast } from 'sonner';
import z from 'zod';

interface IProps {}

export type signinFormSchemaType = z.infer<typeof signinFormSchema>;
export const signinFormSchema = z.object({
  phoneNumber: z
    .string({ required_error: ZOD.ERROR.REQUIRED() })
    .min(1, { message: ZOD.ERROR.REQUIRED() })
    .nullable()
    .refine((val) => val !== '' && val !== null && val !== undefined && !!formatPhoneNumber(val), { message: ZOD.ERROR.REQUIRED() }),
  password: z.string({ required_error: ZOD.ERROR.REQUIRED() }).min(1, { message: ZOD.ERROR.REQUIRED() }),
});

const SigninIndex: React.FC<IProps> = () => {
  const router = useRouter();
  const globalStore = useAppStore('Global');

  const form = useForm<signinFormSchemaType>({ resolver: zodResolver(signinFormSchema) });

  const onSubmit = async (values: signinFormSchemaType) => {
    globalStore?.setIsTemporarySignin(true);
    const response = await asyncGuard(() => Signin({ PhoneNo: values.phoneNumber || '', password: values.password }));
    globalStore?.setIsTemporarySignin(false);
    if (response.error !== null || response.result === null) toast.error(response.error?.toString() || 'Something went wrong!');
    else {
      if (response.result.profile.Verified === '1') {
        globalStore?.setCurrentUserAndProfile(response.result);
        router.replace(AppPages.HOME);
        toast.success('Signed in successfully!');
      } else {
        await asyncGuard(() => Signout());
        router.push(`${AppPages.VERIFICATION}?type=signin&phone=${handleDeformatPhoneNumberForAPI(values.phoneNumber || '')}`);
      }
    }
  };

  return (
    <AuthCardLayout title="Sign in to Continue" coverImageSrc="/images/auth-cover-01.jpg">
      <Form form={form} onSubmit={onSubmit} className="grid w-full gap-2.5">
        <FieldInput form={form} name="phoneNumber" mask="(999) 999-9999" placeholder="Phone Number" />
        <FieldPasswordInput form={form} name="password" placeholder="Password" />
        <FieldLink form={form} href={AppPages.FORGOT_PASSWORD} label="Forgot Password?" classes={{ container: 'w-max ml-auto mt-1' }} />
        <FieldButton form={form} type="submit" classes={{ container: 'w-full mt-2.5' }} label="Sign in" variant="secondary" />
      </Form>
      <div className="mt-2 text-sm text-muted-foreground">
        Don&apos;t have an account? <Link href={AppPages.SIGNUP} label="Create account" />
      </div>
    </AuthCardLayout>
  );
};

export default SigninIndex;
