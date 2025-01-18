import AuthCardLayout from '@/components/layout/auth-card-layout';
import Link from '@/components/ui/link';
import { AppPages } from '@/constants/app-pages.constants';
import { cn } from '@/utils/cn.utils';
import React from 'react';
import { RiBriefcase4Fill, RiFileUserFill } from 'react-icons/ri';

interface IProps {
  selectedAccountType: 'personal' | 'business' | null;
  handleSelectAccountType: (val: 'personal' | 'business') => void;
}

const SignupSelectAccountTypeForm: React.FC<IProps> = ({ selectedAccountType, handleSelectAccountType }) => {
  return (
    <AuthCardLayout title="Select Your Account Type" coverImageSrc="/images/auth-cover-02.jpg">
      <div className="flex w-full flex-row gap-4">
        {[
          { icon: RiBriefcase4Fill, label: 'Pro (Business Account)', value: 'business' as const },
          { icon: RiFileUserFill, label: 'Personal Account', value: 'personal' as const },
        ].map((item) => (
          <div key={item.value} className={cn('group flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-1 border-secondary bg-card px-3 py-5 transition-all hover:bg-secondary hover:text-secondary-foreground md:px-6', selectedAccountType === item.value && 'bg-secondary text-secondary-foreground')} onClick={() => handleSelectAccountType(item.value)}>
            <item.icon size={30} className={cn('group-hover:text-primary', selectedAccountType === item.value && 'text-primary')} />
            <p className="text-center text-base font-medium">{item.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-2 text-sm text-muted-foreground">
        Already have an account? <Link href={AppPages.SIGNIN} label="Sign In" />
      </div>
    </AuthCardLayout>
  );
};

export default SignupSelectAccountTypeForm;
