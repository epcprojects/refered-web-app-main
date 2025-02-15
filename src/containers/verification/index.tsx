'use client';

import { Form } from '@/components/form';
import FieldButton from '@/components/form/field-button';
import FieldOtp from '@/components/form/field-otp';
import AuthCardLayout from '@/components/layout/auth-card-layout';
import { Button } from '@/components/ui/button';
import { AppPages } from '@/constants/app-pages.constants';
import { firebase } from '@/firebase';
import { SendForgotPasswordOTP, SendOTP, VerifyForgotPasswordOTP, VerifyOTP } from '@/firebase/auth';
import { useAppStore } from '@/hooks/use-app-store';
import { useTimer } from '@/hooks/use-timer';
import { asyncGuard } from '@/utils/lodash.utils';
import { ZOD } from '@/utils/zod.utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface IProps {}

export type verificationFormSchemaType = z.infer<typeof verificationFormSchema>;
export const verificationFormSchema = z.object({
  code: z.string({ required_error: ZOD.ERROR.REQUIRED() }).length(6, { message: ZOD.ERROR.OTP() }),
});

const OtpVerificationIndex: React.FC<IProps> = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const globalStore = useAppStore('Global');
  const form = useForm<verificationFormSchemaType>({ resolver: zodResolver(verificationFormSchema) });
  const timer = useTimer({ start: 60, stop: 0 });

  const [isResending, setIsResending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const type = useMemo(() => searchParams.get('type') as 'signin' | 'signup' | 'resetPassword', [searchParams]);
  const phone = useMemo(() => searchParams.get('phone') || '', [searchParams]);

  const handleInitializeRecaptcha = () => {
    if (!window.recaptchaVerifier) window.recaptchaVerifier = new RecaptchaVerifier(firebase.auth, 'recaptcha-container', { size: 'invisible', callback: () => {} });
  };

  const handleSendVerificationCode = async () => {
    console.log('🚀 ~ phone:', phone);
    handleInitializeRecaptcha();
    const response = await asyncGuard(() => (type === 'resetPassword' ? SendForgotPasswordOTP({ PhoneNo: `${phone.trim()}` }) : SendOTP({ PhoneNo: `${phone.trim()}` })));
    if (response.error !== null || response.result === null) toast.error(response.error?.toString() || 'Something went wrong!');
    else setConfirmationResult(response.result);
    return Boolean(response.result !== null);
  };

  const handleResendCode = async () => {
    setIsResending(true);
    const isSuccess = await handleSendVerificationCode();
    if (isSuccess) {
      toast.success('OTP code is sent on your phone number!');
      timer.restart();
    }
    setIsResending(false);
  };

  const onSubmit = async (values: verificationFormSchemaType) => {
    if (confirmationResult === null) toast.error('Invalid or expired OTP entered!');
    else if (type === 'resetPassword') {
      const response = await asyncGuard(() => VerifyForgotPasswordOTP({ PhoneNo: `${phone.trim()}`, confirmationResult: confirmationResult, otp: values.code }));
      if (response.error !== null || response.result === null) toast.error(response.error?.toString() || 'Something went wrong!');
      else router.push(AppPages.RESET_PASSWORD);
    } else {
      const response = await asyncGuard(() => VerifyOTP({ PhoneNo: `${phone.trim()}`, confirmationResult: confirmationResult, otp: values.code }));
      if (response.error !== null || response.result === null) toast.error(response.error?.toString() || 'Something went wrong!');
      else {
        router.replace(AppPages.VERIFICATION_SUCCESS);
        toast.success(type === 'signin' ? 'Signed in successfully!' : 'Signed up successfully!');
      }
    }
  };

  useEffect(() => {
    if (isLoading) return;
    setIsLoading(true);
    handleSendVerificationCode().then(() => setIsLoading(false));
  }, []);

  return (
    <AuthCardLayout title="Enter the 6 digit verification code sent to your mobile number" coverImageSrc="/images/auth-cover-03.jpg" isLoading={isLoading}>
      <Form form={form} onSubmit={onSubmit} className="grid w-full gap-2.5">
        <div className="flex w-full items-center justify-center">
          <FieldOtp form={form} name="code" length={[6]} />
        </div>
        <FieldButton form={form} type="submit" classes={{ container: 'w-full mt-2.5' }} label="Verify" variant="secondary" />
      </Form>
      <div className="mt-2 text-sm text-muted-foreground">
        Didn&apos;t have code? <Button onClick={handleResendCode} disabled={isResending || timer.inProgress} variant="link/secondary" label={timer.inProgress ? `can resend in ${timer.count} secs` : isResending ? 'Resending...' : 'Resend now'} />
      </div>
    </AuthCardLayout>
  );
};

export default OtpVerificationIndex;
