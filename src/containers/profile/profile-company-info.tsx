import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip } from '@/constants/tooltips.constants';
import { IProfileWithFavorites } from '@/firebase/profile';
import Image from 'next/image';
import React, { useState } from 'react';
import { RiInformationLine } from 'react-icons/ri';

interface IProps {
  data: IProfileWithFavorites;
}

const ProfileCompanyInfo: React.FC<IProps> = ({ data }) => (
  <div className="flex flex-col gap-1">
    <h3 className="text-lg font-medium">Company Info</h3>
    <p className="break-words text-sm font-normal leading-5">{data.About}</p>
    <div className="mb-5 mt-3 flex flex-wrap gap-x-7 gap-y-4">
      <div className="flex flex-row items-center gap-1">
        <Image src="/images/logo.png" alt="Logo" width={22} height={22} className="mr-1" />
        <p className="text-sm">Referral ${data.ReferralAmount || 0} </p>

        <InfoDialog description={Tooltip.REFERRAL_FEE_TOOLTIP} />
      </div>
      <div className="flex flex-row items-center gap-1">
        <Image src="/images/referral-discount-icon.svg" alt="Logo" width={22} height={22} className="mr-1" />
        <p className="text-sm">New Customer Discount {data.DiscountPercent || 0}%</p>

        <InfoDialog description={Tooltip.REFERRAL_DISCOUNT_TOOLTIP} />
      </div>
    </div>
  </div>
);

export default ProfileCompanyInfo;

interface IInfoDialog {
  description?: string;
  tagline?: string;
}
const InfoDialog = ({ description = 'Nothing to show.', tagline = '' }: IInfoDialog) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <RiInformationLine className="text-muted-foreground" size={18} />
      </DialogTrigger>
      <DialogContent className="flex max-w-[90%] flex-col items-center justify-center p-4 md:w-[28rem]">
        <Image src="/images/logo.png" alt="Refered Logo" width={60} height={60} />
        <div className="mb-2 flex w-full flex-col items-center justify-center gap-4">
          <p className="mt-1 text-center">{description}</p>
          {tagline.length > 0 && (
            <div className="mx-auto mb-1 flex w-max flex-row items-center gap-1.5">
              <Image src="/images/info-icon.svg" alt="required icon" width={18} height={18} />
              <p className="text-xs text-muted-foreground">{tagline}</p>
            </div>
          )}
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
