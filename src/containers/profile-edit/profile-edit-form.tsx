'use client';

import { Form } from '@/components/form';
import { AppPages } from '@/constants/app-pages.constants';
import { AppRegex } from '@/constants/app-regex.constants';
import { handleDeformatPhoneNumberForAPI } from '@/firebase/auth';
import { IProfileWithFavorites, UpdateBusinessUserProfile, UpdatePersonalUserProfile } from '@/firebase/profile';
import { UploadFile } from '@/firebase/upload';
import { useAppStore } from '@/hooks/use-app-store';
import { asyncGuard } from '@/utils/lodash.utils';
import { ZOD } from '@/utils/zod.utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import SelectBusinessTypeOptions from '../common/select-business-type-options';
import SelectGroupOptions from '../common/select-group-options';
import ProfileEditFormBody from './profile-edit-form-body';
import ProfileEditFormHeader from './profile-edit-form-header';
import ProfileEditFormPaymentInfo from './profile-edit-form-payment-info';

interface IProps {
  data: IProfileWithFavorites;
}

export type businessProfileFormSchemaType = z.infer<typeof businessProfileFormSchema>;
export const businessProfileFormSchema = z.object({
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
  phoneNumber: z.string({ required_error: ZOD.ERROR.REQUIRED() }),
  states: z.string({ required_error: ZOD.ERROR.REQUIRED() }),
  cities: z.string({ required_error: ZOD.ERROR.REQUIRED() }),
  groupName: z.string({ required_error: ZOD.ERROR.REQUIRED() }).min(1, { message: ZOD.ERROR.REQUIRED() }).trim(),
  groupId: z.string({ required_error: ZOD.ERROR.REQUIRED() }).min(1, { message: ZOD.ERROR.REQUIRED() }).trim(),
  zip: z.coerce
    .string({ required_error: ZOD.ERROR.REQUIRED() })
    .min(1, { message: ZOD.ERROR.REQUIRED() })
    .min(5, { message: ZOD.ERROR.MIN_LENGTH_NUMBER(5) })
    .max(10, { message: ZOD.ERROR.MAX_LENGTH_NUMBER(10) })
    .refine((val) => val !== '', { message: ZOD.ERROR.REQUIRED() })
    .refine((val) => val.match(AppRegex.IS_NUMBER), { message: ZOD.ERROR.NUMERIC() }),
  discountPercent: z.coerce
    .string({ required_error: ZOD.ERROR.REQUIRED() })
    .max(4, { message: ZOD.ERROR.MAX_LENGTH_NUMBER(4) })
    .refine((val) => val !== '', { message: ZOD.ERROR.REQUIRED() })
    .refine((val) => val.match(AppRegex.IS_NUMBER), { message: ZOD.ERROR.NUMERIC() }),
  description: z
    .string({ required_error: ZOD.ERROR.REQUIRED() })
    .min(1, { message: ZOD.ERROR.REQUIRED() })
    .max(100, { message: ZOD.ERROR.MAX_LENGTH(100) })
    .trim(),
  referralAmount: z.coerce
    .string({ required_error: ZOD.ERROR.REQUIRED() })
    .refine((val) => val !== '', { message: ZOD.ERROR.REQUIRED() })
    .refine((val) => val.match(AppRegex.IS_NUMBER), { message: ZOD.ERROR.NUMERIC() }),
  email: z.string({ required_error: ZOD.ERROR.REQUIRED() }).min(1, { message: ZOD.ERROR.REQUIRED() }).email({ message: ZOD.ERROR.EMAIL() }).trim().toLowerCase(),
});

const businessProfileFormDefaultValues = (data: IProps['data']): businessProfileFormSchemaType => ({
  businessTypeName: data.UserType === 'Normal' ? '0' : data.BusinessTypeName || '',
  businessTypeId: data.UserType === 'Normal' ? '0' : data.BusinessId || '',
  businessName: data.UserType === 'Normal' ? '0' : data.BusinessName || '',
  firstName: data.FirstName || '',
  lastName: data.LastName || '',
  phoneNumber: handleDeformatPhoneNumberForAPI(data.PhoneNo) || '',
  cities: data.City || '',
  states: data.State || '',
  groupName: data.groupData?.name || '',
  groupId: data.groupData?.id || '',
  zip: data.UserType === 'Normal' ? '0' : data.ZipCode || '',
  discountPercent: data.UserType === 'Normal' ? '0' : data.DiscountPercent || '',
  description: data.UserType === 'Normal' ? '0' : data.About || '',
  email: data.userEmail || '',
  referralAmount: data.UserType === 'Normal' ? '0' : data.ReferralAmount || '',
});

const ProfileEditForm: React.FC<IProps> = ({ data }) => {
  const globalStore = useAppStore('Global');
  const query = useSearchParams();
  const router = useRouter();

  const form = useForm<businessProfileFormSchemaType>({ resolver: zodResolver(businessProfileFormSchema), defaultValues: businessProfileFormDefaultValues(data) });

  const businessTypeNameWatch = form.watch('businessTypeName');
  const businessTypeIdWatch = form.watch('businessTypeId');
  const groupNameWatch = form.watch('groupName');
  const groupIdWatch = form.watch('groupId');

  const isBusinessForm = useMemo(() => Boolean(data.UserType === 'Business'), [data]);

  const [openedBusinessTypeOptions, setOpenedBusinessTypeOptions] = useState(false);
  const [openedGroupOptions, setOpenedGroupOptions] = useState(false);
  const [canProceed, setCanProceed] = useState(false);
  const [selectedProfilePic, setSelectedProfilePic] = useState<File | null>(null);

  const handleToggleOpenBusinessTypeOptions = () => setOpenedBusinessTypeOptions((prev) => !prev);
  const handleSelectBusinessType = (data: { label: string; value: string }) => {
    form.setValue('businessTypeName', data.label);
    form.setValue('businessTypeId', data.value);
    handleToggleOpenBusinessTypeOptions();
    if (form.formState.errors['businessTypeName']) form.trigger('businessTypeName');
  };

  const handleToggleOpenGroupOptions = () => setOpenedGroupOptions((prev) => !prev);
  const handleSelectGroup = (data: { label: string; value: string }) => {
    form.setValue('groupName', data.label);
    form.setValue('groupId', data.value);
    handleToggleOpenGroupOptions();
    if (form.formState.errors['groupName']) form.trigger('groupName');
  };

  const onSubmit = async (values: businessProfileFormSchemaType) => {
    if (!!selectedProfilePic === false && !!data.ImageUrl === false) {
      toast.error('Profile picture is required!');
      return;
    }

    const { firstName, lastName, email, groupId, groupName, description, businessTypeId, businessTypeName, businessName, discountPercent, referralAmount, zip } = values;
    let uploadedProfilePicUrl = data.ImageUrl || '';

    if (isBusinessForm && Number(referralAmount) < 5) {
      form.setError('referralAmount', { message: 'Referral amount must be atleat $5' });
      return;
    }

    if (selectedProfilePic !== null) {
      const uploadImageResponse = await asyncGuard(() => UploadFile({ type: 'avatar', file: selectedProfilePic }));
      if (uploadImageResponse.result !== null) uploadedProfilePicUrl = uploadImageResponse.result;
    }

    if (isBusinessForm) {
      const response = await asyncGuard(() => UpdateBusinessUserProfile({ id: data.UserId, ImageUrl: uploadedProfilePicUrl, FirstName: firstName, LastName: lastName, userEmail: email, About: description, BusinessId: businessTypeId, BusinessTypeName: businessTypeName, BusinessName: businessName, GroupId: groupId, ReferralAmount: referralAmount, ZipCode: zip, DiscountPercent: discountPercent }));
      if (response.error !== null || response.result === null) toast.error(response.error?.toString() || 'Something went wrong!');
      else {
        if (globalStore?.currentUser) globalStore.setCurrentUserProfile({ profile: { ...response.result, groupData: { id: groupId, name: groupName } } });
        toast.success('Profile updated successfully!');
        setCanProceed(true);
      }
    } else {
      const response = await asyncGuard(() => UpdatePersonalUserProfile({ id: data.UserId, FirstName: firstName, LastName: lastName, userEmail: email, ImageUrl: uploadedProfilePicUrl, GroupId: groupId }));
      if (response.error !== null || response.result === null) toast.error(response.error?.toString() || 'Something went wrong!');
      else {
        if (globalStore?.currentUser) globalStore.setCurrentUserProfile({ profile: { ...response.result, groupData: { id: groupId, name: groupName } } });
        toast.success('Profile updated successfully!');
        setCanProceed(true);
      }
    }

    return;
  };

  const handleGoBackHome = () => {
    if (document.referrer) router.back();
    else router.push(AppPages.HOME);
  };

  useLayoutEffect(() => {
    if (query.get('q') === 'payment') {
      setCanProceed(true);
    }
  }, []);

  useEffect(() => {
    form.clearErrors();
  }, []);

  if (openedBusinessTypeOptions) return <SelectBusinessTypeOptions handleGoBack={handleToggleOpenBusinessTypeOptions} selectedOption={!!businessTypeIdWatch === false ? null : { label: businessTypeNameWatch, value: businessTypeIdWatch }} handleSelectOption={handleSelectBusinessType} notForAuthPage />;
  else if (openedGroupOptions) return <SelectGroupOptions handleGoBack={handleToggleOpenGroupOptions} selectedOption={!!groupIdWatch === false ? null : { label: groupNameWatch, value: groupIdWatch }} handleSelectOption={handleSelectGroup} notForAuthPage />;
  else if (canProceed)
    return (
      <ProfileEditFormPaymentInfo
        handleGoBack={() => {
          if (query.get('q') === 'payment') {
            handleGoBackHome();
          } else {
            setCanProceed(false);
          }
        }}
        handleGetFormData={() => form.getValues()}
        data={data}
      />
    );
  return (
    <Form form={form} onSubmit={onSubmit} className="flex flex-col gap-14">
      <ProfileEditFormHeader isSubmitting={form.formState.isSubmitting} handleGoBack={handleGoBackHome} profileName={[data.FirstName, data.LastName].join(' ').trim()} profilePicUrl={data.ImageUrl} setSelectedProfilePic={setSelectedProfilePic} />
      <ProfileEditFormBody form={form} handleToggleOpenBusinessTypeOptions={handleToggleOpenBusinessTypeOptions} handleToggleOpenGroupOptions={handleToggleOpenGroupOptions} selectedProfilePic={selectedProfilePic} isBusinessForm={isBusinessForm} />
    </Form>
  );
};

export default ProfileEditForm;
