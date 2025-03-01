'use client';

import FieldInput from '@/components/form/field-input';
import FieldSelectButton from '@/components/form/field-select-button';
import FieldTextarea from '@/components/form/field-textarea';
import StateCitySelect from '@/components/form/state-city-select';
import Image from 'next/image';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { RiLock2Fill } from 'react-icons/ri';
import { businessProfileFormSchemaType } from './profile-edit-form';

interface IProps {
  form: UseFormReturn<businessProfileFormSchemaType>;
  handleToggleOpenBusinessTypeOptions: () => void;
  selectedProfilePic: File | null;
  isBusinessForm: boolean;
}

const ProfileEditFormBody: React.FC<IProps> = ({ form, isBusinessForm, handleToggleOpenBusinessTypeOptions }) => {
  const referralAmountWatch = form.watch('referralAmount');

  return (
    <div className="grid w-full gap-2.5 p-4">
      <div className="mb-1 flex flex-row items-center gap-1.5">
        <Image src="/images/info-icon.svg" alt="required icon" width={18} height={18} />
        <p className="text-xs text-muted-foreground">All Fields are required</p>
      </div>
      {!isBusinessForm ? null : <FieldSelectButton form={form} name="businessTypeName" placeholder="Select from Business" className="mb-2" onClick={handleToggleOpenBusinessTypeOptions} />}
      {!isBusinessForm ? null : <FieldInput form={form} name="businessName" placeholder="Business Name" />}
      <div className="grid w-full grid-cols-2 gap-4">
        <FieldInput form={form} name="firstName" placeholder="First Name" />
        <FieldInput form={form} name="lastName" placeholder="Last Name" />
      </div>
      <FieldInput form={form} name="phoneNumber" placeholder="Phone Number" disabled rightElement={<RiLock2Fill size={18} />} containerClassName="opacity-100" />
      <StateCitySelect form={form} />
      {!isBusinessForm ? null : (
        <div className="grid w-full grid-cols-2 gap-4">
          <FieldInput form={form} type="number" name="zip" placeholder="Zip Code" min={5} maxLength={10} />
          <FieldInput form={form} type="number" name="discountPercent" placeholder="Discount %" />
        </div>
      )}
      {!isBusinessForm ? null : <FieldTextarea form={form} name="description" placeholder="Description" />}
      {!isBusinessForm ? null : <FieldInput form={form} onChange={(e) => form.setValue('referralAmount', String(e.currentTarget.value.length >= 5 ? Number(referralAmountWatch) : Number(e.currentTarget.value)))} type="number" name="referralAmount" placeholder="Referral Amount" />}
      {!isBusinessForm ? null : (
        <div className="mb-2 flex flex-row items-center gap-1.5">
          <Image src="/images/logo.png" alt="Logo" width={18} height={18} />
          <p className="text-xs text-muted-foreground">Refer&apos;d Lead amount is ${isNaN(Number(referralAmountWatch)) ? 0 : referralAmountWatch || 0}</p>
        </div>
      )}
      <FieldInput form={form} name="email" placeholder="Email Address" />
    </div>
  );
};

export default ProfileEditFormBody;
