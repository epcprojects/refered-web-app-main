import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { IProfileWithFavorites } from '@/firebase/profile';
import Image from 'next/image';
import React, { useState } from 'react';
import { RiInformationFill } from 'react-icons/ri';

interface IProps {
  data: IProfileWithFavorites;
}

const ProfileCompanyInfo: React.FC<IProps> = ({ data }) => (
  <div className="flex flex-col gap-1">
    <h3 className="text-lg font-medium">Company Info</h3>
    <p className="break-words text-sm font-normal leading-5">{data.About}</p>
    <div className="mb-4 mt-2 flex flex-row items-center gap-2">
      <Image src="/images/logo.png" alt="Logo" width={22} height={22} />
      <p className="text-sm">${data.ReferralAmount || 0} Referral</p>
      <InfoDialog />
    </div>
  </div>
);

export default ProfileCompanyInfo;

const InfoDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <RiInformationFill size={18} />
      </DialogTrigger>
      <DialogContent className="flex max-w-[90%] flex-col items-center justify-center p-4 md:w-[28rem]">
        <Image src="/images/logo.png" alt="Refered Logo" width={60} height={60} />
        <div className="mb-2 flex w-full flex-col items-center justify-center gap-4">
          <p className="mt-1 text-center">Refer'd respects the real estate license laws and this platform does not support real estate agents paying referral fees. Instead we promote the use of customers leads that turn into buying or seller clients under the respective brokers.</p>
          <div className="mx-auto mb-1 flex w-max flex-row items-center gap-1.5">
            <Image src="/images/info-icon.svg" alt="required icon" width={18} height={18} />
            <p className="text-xs text-muted-foreground">Processing fees are not included</p>
          </div>
        </div>
        <div className="flex w-full flex-row gap-4">
          <Button variant="secondary" size="lg" onClick={handleClose} classes={{ container: 'flex-1' }}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
