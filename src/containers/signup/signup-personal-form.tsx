'use client';

import { Form } from '@/components/form';
import FieldButton from '@/components/form/field-button';
import FieldSelectDropdown from '@/components/form/field-dropdown';
import FieldInput from '@/components/form/field-input';
import FieldPasswordInput from '@/components/form/field-password-input';
import AuthCardLayout from '@/components/layout/auth-card-layout';
import Link from '@/components/ui/link';
import UpdateProfileAvatar from '@/components/ui/update-profile-avatar';
import { AppPages } from '@/constants/app-pages.constants';
import { AppRegex } from '@/constants/app-regex.constants';
import { StateKeys, USA_CITY_AND_STATES } from '@/constants/countries.constants';
import { handleDeformatPhoneNumberForAPI, Signout, SignupPersonal } from '@/firebase/auth';
import { useAppStore } from '@/hooks/use-app-store';
import { cn } from '@/utils/cn.utils';
import { asyncGuard } from '@/utils/lodash.utils';
import { ZOD } from '@/utils/zod.utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { RiCheckboxCircleLine } from 'react-icons/ri';
import { toast } from 'sonner';
import { z } from 'zod';

interface IProps {
  handleGoBack: () => void;
}

export type signupPersonalFormSchemaType = z.infer<typeof signupPersonalFormSchema>;
export const signupPersonalFormSchema = z.object({
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
  states: z.string({ required_error: ZOD.ERROR.REQUIRED() }),
  cities: z.string({ required_error: ZOD.ERROR.REQUIRED() }),
  phoneNumber: z.string({ required_error: 'Phone number is required' }).min(10, { message: 'Phone number is required' }),
  email: z.string({ required_error: ZOD.ERROR.REQUIRED() }).min(1, { message: ZOD.ERROR.REQUIRED() }).email({ message: ZOD.ERROR.EMAIL() }).trim().toLowerCase(),
  password: z
    .string({ required_error: ZOD.ERROR.REQUIRED() })
    .min(6, { message: ZOD.ERROR.MIN_LENGTH(6) })
    .max(30, { message: ZOD.ERROR.MAX_LENGTH(30) })
    .regex(AppRegex.ATLEAST_ONE_LOWERCASE_LETTER, ZOD.ERROR.ATLEAST_ONE_LOWERCASE_LETTER())
    .regex(AppRegex.ATLEAST_ONE_UPPERCASE_LETTER, ZOD.ERROR.ATLEAST_ONE_UPPERCASE_LETTER())
    .regex(AppRegex.ATLEAST_ONE_SPECIAL_CHARACTER, ZOD.ERROR.ATLEAST_ONE_SPECIAL_CHARACTER()),
});

const SignupPersonalForm: React.FC<IProps> = ({ handleGoBack }) => {
  const router = useRouter();
  const globalStore = useAppStore('Global');
  const USA_STATES = Object.keys(USA_CITY_AND_STATES).map((val) => ({ label: val, value: val }));

  const [DEFAULT_SELECTED_STATE, SET_DEFAULT_SELECTED_STATE] = useState<StateKeys>('California');

  const USE_CITIES_OF_SELECTED_STATE = useCallback(() => {
    return USA_CITY_AND_STATES[DEFAULT_SELECTED_STATE].map((val) => ({ label: val, value: val }));
  }, [DEFAULT_SELECTED_STATE]);

  const form = useForm<signupPersonalFormSchemaType>({ resolver: zodResolver(signupPersonalFormSchema) });
  const [selectedProfilePic, setSelectedProfilePic] = useState<File | null>(null);

  const passwordWatch = form.watch('password');

  const onSubmit = async (values: signupPersonalFormSchemaType) => {
    console.log('🚀 ~ onSubmit ~ values:', values);
    if (!!selectedProfilePic === false) {
      toast.error('Profile picture is required!');
      return;
    }

    globalStore?.setIsTemporarySignin(true);

    const response = await asyncGuard(() => SignupPersonal({ profileImageFile: selectedProfilePic, FirstName: values.firstName, LastName: values.lastName, email: values.email, password: values.password, PhoneNo: values.phoneNumber || '', State: values.states, City: values.cities }));
    globalStore?.setIsTemporarySignin(false);
    if (response.error !== null || response.result === null) toast.error(response.error?.toString() || 'Something went wrong!');
    else {
      await Signout();
      router.push(`${AppPages.VERIFICATION}?type=signup&phone=${handleDeformatPhoneNumberForAPI(values.phoneNumber || '')}`);
    }
  };

  useEffect(() => {
    if (!!passwordWatch) form.trigger('password');

    form.setValue('states', DEFAULT_SELECTED_STATE);
    form.setValue('cities', USA_CITY_AND_STATES[DEFAULT_SELECTED_STATE][0]);
  }, [passwordWatch]);

  return (
    <AuthCardLayout title="Tell us who you are!" onBack={handleGoBack} coverImageSrc="/images/auth-cover-03.jpg">
      <Form form={form} onSubmit={onSubmit} className="grid w-full gap-2.5">
        <UpdateProfileAvatar setSelectedProfilePic={setSelectedProfilePic} profileName="ABC" profilePicUrl="" />
        <div className="grid w-full grid-cols-2 gap-2.5">
          <FieldInput form={form} name="firstName" placeholder="First Name" />
          <FieldInput form={form} name="lastName" placeholder="Last Name" />
        </div>
        <FieldInput form={form} name="phoneNumber" mask={Mask.USA} placeholder="Phone Number" />
        <div className="grid w-full grid-cols-2 gap-2.5">
          <FieldSelectDropdown
            form={form}
            options={USA_STATES}
            defaultValue={DEFAULT_SELECTED_STATE}
            onChange={(value) => {
              SET_DEFAULT_SELECTED_STATE(value as StateKeys);
            }}
            placeholder="State"
            name="states"
          />
          <FieldSelectDropdown form={form} options={USE_CITIES_OF_SELECTED_STATE()} defaultValue={USE_CITIES_OF_SELECTED_STATE()[0].value} placeholder="City" name="cities" />
        </div>
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

export default SignupPersonalForm;
