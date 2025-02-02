'use client';

import { Form } from '@/components/form';
import FieldButton from '@/components/form/field-button';
import FieldInput from '@/components/form/field-input';
import FieldPasswordInput from '@/components/form/field-password-input';
import FieldSelectButton from '@/components/form/field-select-button';
import AuthCardLayout from '@/components/layout/auth-card-layout';
import Link from '@/components/ui/link';
import UpdateProfileAvatar from '@/components/ui/update-profile-avatar';
import { AppPages } from '@/constants/app-pages.constants';
import { AppRegex } from '@/constants/app-regex.constants';
import SelectBusinessTypeOptions from '@/containers/common/select-business-type-options';
import { handleDeformatPhoneNumberForAPI, Signout, SignupBusiness } from '@/firebase/auth';
import { UploadFile } from '@/firebase/upload';
import { useAppStore } from '@/hooks/use-app-store';
import { cn } from '@/utils/cn.utils';
import { asyncGuard, ValidateUSFormatPhoneNumber } from '@/utils/lodash.utils';
import { ZOD } from '@/utils/zod.utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { RiCheckboxCircleLine } from 'react-icons/ri';
import { toast } from 'sonner';
import { z } from 'zod';

interface IProps {
  handleGoBack: () => void;
}

export type signupBusinessFormSchemaType = z.infer<typeof signupBusinessFormSchema>;
export const signupBusinessFormSchema = z.object({
  businessTypeName: z.string({ required_error: ZOD.ERROR.REQUIRED() }).min(1, { message: ZOD.ERROR.REQUIRED() }).trim(),
  businessTypeId: z.string({ required_error: ZOD.ERROR.REQUIRED() }).min(1, { message: ZOD.ERROR.REQUIRED() }).trim(),
  businessName: z
    .string({ required_error: ZOD.ERROR.REQUIRED() })
    .min(1, { message: ZOD.ERROR.REQUIRED() })
    .max(30, { message: ZOD.ERROR.MAX_LENGTH(30) })
    .trim(),
  firstName: z
    .string({ required_error: ZOD.ERROR.REQUIRED() })
    .min(1, { message: ZOD.ERROR.REQUIRED() })
    .max(30, { message: ZOD.ERROR.MAX_LENGTH(30) })
    .trim(),
  lastName: z
    .string({ required_error: ZOD.ERROR.REQUIRED() })
    .min(1, { message: ZOD.ERROR.REQUIRED() })
    .max(30, { message: ZOD.ERROR.MAX_LENGTH(30) })
    .trim(),
  phoneNumber: z
    .string({ required_error: 'Phone number is required' })
    .min(1, { message: 'Phone number is required' })
    .nullable()
    .refine(
      (val) => {
        if (val && val !== '') {
          return ValidateUSFormatPhoneNumber(val); // Validate the phone number format
        }
        return true;
      },
      { message: 'Invalid US phone number format +123456789' },
    ),
  email: z.string({ required_error: ZOD.ERROR.REQUIRED() }).min(1, { message: ZOD.ERROR.REQUIRED() }).email({ message: ZOD.ERROR.EMAIL() }).trim().toLowerCase(),
  password: z
    .string({ required_error: ZOD.ERROR.REQUIRED() })
    .min(6, { message: ZOD.ERROR.MIN_LENGTH(6) })
    .max(30, { message: ZOD.ERROR.MAX_LENGTH(30) })
    .regex(AppRegex.ATLEAST_ONE_LOWERCASE_LETTER, ZOD.ERROR.ATLEAST_ONE_LOWERCASE_LETTER())
    .regex(AppRegex.ATLEAST_ONE_UPPERCASE_LETTER, ZOD.ERROR.ATLEAST_ONE_UPPERCASE_LETTER())
    .regex(AppRegex.ATLEAST_ONE_SPECIAL_CHARACTER, ZOD.ERROR.ATLEAST_ONE_SPECIAL_CHARACTER()),
});

const SignupBusinessForm: React.FC<IProps> = ({ handleGoBack }) => {
  const router = useRouter();
  const globalStore = useAppStore('Global');

  const form = useForm<signupBusinessFormSchemaType>({ resolver: zodResolver(signupBusinessFormSchema) });

  const [openedBusinessTypeOptions, setOpenedBusinessTypeOptions] = useState(false);
  const [selectedProfilePic, setSelectedProfilePic] = useState<File | null>(null);

  const businessTypeName = form.watch('businessTypeName');
  const businessTypeId = form.watch('businessTypeId');
  const passwordWatch = form.watch('password');

  const handleToggleOpenBusinessTypeOptions = () => setOpenedBusinessTypeOptions((prev) => !prev);
  const handleSelectBusinessType = (data: { label: string; value: string }) => {
    form.setValue('businessTypeName', data.label);
    form.setValue('businessTypeId', data.value);
    handleToggleOpenBusinessTypeOptions();
    if (form.formState.errors['businessTypeName']) form.trigger('businessTypeName');
  };

  const onSubmit = async (values: signupBusinessFormSchemaType) => {
    if (!!selectedProfilePic === false) {
      toast.error('Profile picture is required!');
      return;
    }

    let profilePicUrl = '';
    globalStore?.setIsTemporarySignin(true);

    if (selectedProfilePic !== null) {
      const uploadImageResponse = await asyncGuard(() => UploadFile({ type: 'avatar', file: selectedProfilePic }));
      if (uploadImageResponse.result !== null) profilePicUrl = uploadImageResponse.result;
    }

    const response = await asyncGuard(() => SignupBusiness({ ImageUrl: profilePicUrl, FirstName: values.firstName, LastName: values.lastName, email: values.email, password: values.password, PhoneNo: values.phoneNumber || '', BusinessName: values.businessName, BusinessId: values.businessTypeId, BusinessTypeName: values.businessTypeName }));
    globalStore?.setIsTemporarySignin(false);
    if (response.error !== null || response.result === null) toast.error(response.error?.toString() || 'Something went wrong!');
    else {
      await Signout();
      router.replace(`${AppPages.VERIFICATION}?type=signup&phone=${handleDeformatPhoneNumberForAPI(values.phoneNumber || '')}`);
    }
  };

  useEffect(() => {
    if (!!passwordWatch) form.trigger('password');
  }, [passwordWatch]);

  if (openedBusinessTypeOptions) return <SelectBusinessTypeOptions handleGoBack={handleToggleOpenBusinessTypeOptions} selectedOption={!!businessTypeId === false ? null : { label: businessTypeName, value: businessTypeId }} handleSelectOption={handleSelectBusinessType} />;
  return (
    <AuthCardLayout title="Tell us about your business" onBack={handleGoBack} coverImageSrc="/images/auth-cover-03.jpg">
      <Form form={form} onSubmit={onSubmit} className="grid w-full gap-2.5">
        <UpdateProfileAvatar setSelectedProfilePic={setSelectedProfilePic} profileName="ABC" profilePicUrl="" />
        <FieldSelectButton form={form} name="businessTypeName" placeholder="Select from Business" className="mb-2" onClick={handleToggleOpenBusinessTypeOptions} />
        <FieldInput form={form} name="businessName" placeholder="Business Name" />
        <div className="grid w-full grid-cols-2 gap-2.5">
          <FieldInput form={form} name="firstName" placeholder="First Name" />
          <FieldInput form={form} name="lastName" placeholder="Last Name" />
        </div>
        <FieldInput form={form} name="phoneNumber" placeholder="Phone Number" />
        {/* <FieldPhoneNumberNew form={form} name="phoneNumber" placeholder="Phone Number" /> */}
        <FieldInput form={form} name="email" placeholder="Email Address" />
        {/* <div className="mb-1">
          <FieldInput form={form} name="email" placeholder="Email Address" errorConfig={{ disableErrorMsg: true }} />
          <div className="flex flex-row items-center gap-1 text-xs text-foreground">
            <RiInformationFill />
            <span>You'll use this email when you login and want to reset your password</span>
          </div>
        </div> */}
        <div>
          <FieldPasswordInput form={form} name="password" placeholder="Password" errorConfig={{ disableErrorMsg: true }} />
          <div className="flex flex-col gap-1">
            {[
              { label: 'Must be between 6 to 30 characters', isValid: !!passwordWatch && form.formState.errors.password?.type !== ZOD.ERROR_CODE.TOO_SMALL && form.formState.errors.password?.type !== ZOD.ERROR_CODE.TOO_BIG },
              { label: 'Must contain one uppercase, lowercase and special characters', isValid: !!passwordWatch && !!form.formState.errors.password === false },
            ].map((item, index) => (
              <div key={index} className={cn('flex flex-row items-center gap-1 text-xs text-foreground', !!passwordWatch || form.formState.errors['password'] ? (item.isValid ? 'text-foreground' : 'text-destructive') : '')}>
                <RiCheckboxCircleLine size={14} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <FieldButton form={form} type="submit" classes={{ container: 'w-full mt-2.5' }} label="Sign Up" variant="secondary" />
        <div className="text-center text-xs text-muted-foreground">
          By Signing up you agree to our <Link href={AppPages.TERMS} target="_blank" classes={{ label: 'text-xs' }} label="Terms" />, <Link href={AppPages.DATA_POLICY} target="_blank" classes={{ label: 'text-xs' }} label="Data Policy" /> and <Link href={AppPages.COOKIE_POLICY} target="_blank" classes={{ label: 'text-xs' }} label="Cookie Policy" />
        </div>
      </Form>
      <div className="mt-2 text-sm text-muted-foreground">
        Already have an account? <Link href={AppPages.SIGNIN} label="Sign In" />
      </div>
    </AuthCardLayout>
  );
};

export default SignupBusinessForm;
