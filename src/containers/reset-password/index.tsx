'use client';

import { Form } from '@/components/form';
import FieldButton from '@/components/form/field-button';
import FieldPasswordInput from '@/components/form/field-password-input';
import AuthCardLayout from '@/components/layout/auth-card-layout';
import Link from '@/components/ui/link';
import { AppPages } from '@/constants/app-pages.constants';
import { AppRegex } from '@/constants/app-regex.constants';
import { ResetPassword, Signout } from '@/firebase/auth';
import { useAppStore } from '@/hooks/use-app-store';
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

export type resetPasswordFormSchemaType = z.infer<typeof resetPasswordFormSchema>;
export const resetPasswordFormSchema = z
  .object({
    password: z
      .string({ required_error: ZOD.ERROR.REQUIRED() })
      .min(6, { message: ZOD.ERROR.MIN_LENGTH(6) })
      .regex(AppRegex.ATLEAST_ONE_LOWERCASE_LETTER, ZOD.ERROR.ATLEAST_ONE_LOWERCASE_LETTER())
      .regex(AppRegex.ATLEAST_ONE_UPPERCASE_LETTER, ZOD.ERROR.ATLEAST_ONE_UPPERCASE_LETTER())
      .regex(AppRegex.ATLEAST_ONE_SPECIAL_CHARACTER, ZOD.ERROR.ATLEAST_ONE_SPECIAL_CHARACTER()),
    confirmPassword: z.string({ required_error: ZOD.ERROR.REQUIRED() }).min(6, { message: ZOD.ERROR.REQUIRED() }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) ctx.addIssue({ code: 'custom', message: "Passwords doesn't match", path: ['confirmPassword'] });
  });

const ResetPasswordIndex: React.FC<IProps> = () => {
  const router = useRouter();
  const globalStore = useAppStore('Global');

  const form = useForm<resetPasswordFormSchemaType>({ resolver: zodResolver(resetPasswordFormSchema) });

  const onSubmit = async (values: resetPasswordFormSchemaType) => {
    if (globalStore === null || globalStore.currentUser === null) {
      globalStore?.setIsResetPasswordSignin(false);
      toast.error('Session expired!');
      router.push(AppPages.SIGNIN);
      return;
    }

    const currentUser = globalStore.currentUser;
    const response = await asyncGuard(() => ResetPassword({ user: currentUser, password: values.password }));

    if (response.error !== null || response.result === null) toast.error(response.error?.toString() || 'Something went wrong!');
    else {
      localStorage.setItem('password_reset', 'success');
      await Signout();
      globalStore?.setIsResetPasswordSignin(false);
      router.push(AppPages.SIGNIN);
    }
  };

  return (
    <AuthCardLayout title="Create New Password" coverImageSrc="/images/auth-cover-02.jpg">
      <Form form={form} onSubmit={onSubmit} className="grid w-full gap-2.5">
        <FieldPasswordInput form={form} name="password" placeholder="Password" />
        <FieldPasswordInput form={form} name="confirmPassword" placeholder="Confirm Password" />
        <FieldButton form={form} type="submit" classes={{ container: 'w-full' }} label="Submit" variant="secondary" />
      </Form>
      <Link href={AppPages.SIGNIN} label="Back to Login" classes={{ container: 'group mt-2 text-sm gap-0.5' }} leftElement={<LuChevronLeft className="transition-all group-hover:-translate-x-1" />} />
    </AuthCardLayout>
  );
};

export default ResetPasswordIndex;
