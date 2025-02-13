import { Form } from '@/components/form';
import FieldButton from '@/components/form/field-button';
import FieldCheckbox from '@/components/form/field-checkbox';
import FieldInput from '@/components/form/field-input';
import AuthCardLayout from '@/components/layout/auth-card-layout';
import { AppPages } from '@/constants/app-pages.constants';
import { IProfileWithFavorites, UpdateUserPaymentInfo } from '@/firebase/profile';
import { useAppStore } from '@/hooks/use-app-store';
import { cn } from '@/utils/cn.utils';
import { asyncGuard, startCase } from '@/utils/lodash.utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckedState } from '@radix-ui/react-checkbox';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { businessProfileFormSchemaType } from './profile-edit-form';

interface IProps {
  handleGoBack: () => void;
  handleGetFormData: () => businessProfileFormSchemaType;
  data: IProfileWithFavorites;
}

export type profilePaymentInfoFormSchemaType = z.infer<typeof profilePaymentInfoFormSchema>;
const profilePaymentInfoFormSchema = z.object({
  type: z.enum(['cashApp', 'paypal', 'venmo']),
  cashAppId: z.string().optional(),
  paypalId: z.string().optional(),
  venmoId: z.string().optional(),
  markDefault: z.any(),
});

const ProfileEditFormPaymentInfo: React.FC<IProps> = ({ handleGoBack, data, handleGetFormData }) => {
  const router = useRouter();
  const globalStore = useAppStore('Global');
  const [checked, setChecked] = useState<CheckedState>(false);

  const form = useForm<profilePaymentInfoFormSchemaType>({ resolver: zodResolver(profilePaymentInfoFormSchema), defaultValues: { type: 'cashApp', cashAppId: data.cashAppId, paypalId: data.paypalId, venmoId: data.venmoId } });

  const typeWatch = form.watch('type');

  const handleUpdateType = (val: string) => {
    form.setValue('type', val as any);
    setChecked(val === data.default);
  };
  const onSubmit = async (values: profilePaymentInfoFormSchemaType) => {
    const { cashAppId, paypalId, venmoId, type } = values;
    const profileData = handleGetFormData();

    let defaultObject = {};

    if (type === data.default && checked === false) {
      defaultObject = { default: 'none' };
    }

    if (checked) {
      defaultObject = { default: type };
    }

    const response = await asyncGuard(() => UpdateUserPaymentInfo({ id: data.UserId, cashAppId: cashAppId || '', paypalId: paypalId || '', venmoId: venmoId || '', ...defaultObject }));
    if (response.error !== null || response.result === null) toast.error(response.error?.toString() || 'Something went wrong!');
    else {
      if (globalStore?.currentUser) globalStore.setCurrentUserAndProfile({ user: globalStore.currentUser, profile: { ...response.result, groupData: { id: profileData.groupId, name: profileData.groupName } } });
      toast.success('Profile updated successfully!');
      router.push(AppPages.HOME);
    }
  };

  return (
    <AuthCardLayout title="Account Information" onBack={handleGoBack} containerClassName="gap-2" coverImageSrc="/images/auth-cover-03.jpg" notForAuthPage>
      <Form form={form} onSubmit={onSubmit} className="flex w-full flex-col gap-4">
        <div className="flex h-10 w-full flex-row rounded-md border-2 border-secondary">
          {[
            { label: 'Cash App', value: 'cashApp' },
            { label: 'Paypal', value: 'paypal' },
            { label: 'Venmo', value: 'venmo' },
          ].map((item) => (
            <button type="button" key={item.value} className={cn('h-full w-full flex-1 cursor-pointer transition-colors hover:bg-secondary/10', item.value === typeWatch && '!bg-secondary text-secondary-foreground')} onClick={() => handleUpdateType(item.value)}>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
        {typeWatch === 'cashApp' ? <FieldInput form={form} name="cashAppId" placeholder={startCase(typeWatch + 'ID')} /> : null}
        {typeWatch === 'paypal' ? <FieldInput form={form} name="paypalId" placeholder={startCase(typeWatch + 'ID')} /> : null}
        {typeWatch === 'venmo' ? <FieldInput form={form} name="venmoId" placeholder={startCase(typeWatch + 'ID')} /> : null}
        <FieldCheckbox form={form} labelConfig={{ value: 'Mark it default' }} checked={checked} onCheckedChange={setChecked} name="markDefault" />
        <FieldButton form={form} type="submit" classes={{ container: 'w-full mt-2.5' }} label="Submit" variant="secondary" />
      </Form>
    </AuthCardLayout>
  );
};

export default ProfileEditFormPaymentInfo;
