import Avatar from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AppPages } from '@/constants/app-pages.constants';
import { IFavorite } from '@/firebase/favorite';
import { initials } from '@/utils/lodash.utils';

import NextLink from 'next/link';
import { RiNewsLine } from 'react-icons/ri';

interface IProps {
  count: number;
  data?: IFavorite[];
  shade?: 'dark' | 'light';
}

const ProfileListDialog: React.FC<IProps> = ({ count, data, shade = 'light' }) => (
  <Dialog>
    <DialogTrigger onClick={(e) => e.stopPropagation()} className="text-start">
      {count > 0 && (
        <div className={`flex cursor-pointer items-center gap-1 rounded-full border-1 border-border ${shade === 'dark' ? 'border-black border-opacity-15' : ''} p-[3px] transition-all hover:bg-slate-100`}>
          <span className="mr-0.5 w-max max-w-16 overflow-hidden text-ellipsis whitespace-nowrap text-[11px] 2xs:max-w-10 xs:max-w-18">+ {count}</span>
        </div>
      )}
    </DialogTrigger>
    <DialogContent style={{ background: '#FFFFFF' }}>
      <DialogTitle>Refer'd by</DialogTitle>
      {data?.length &&
        data.map((item) => (
          <NextLink href={`${AppPages.PROFILE}/${item.ProfileId}`} key={item.id} className="flex w-full cursor-pointer flex-row items-center justify-between rounded-md p-2 transition-colors hover:bg-background/80">
            <div className="flex w-full max-w-full flex-row gap-3 overflow-hidden">
              <Avatar src={item.ImageUrl} alt={[item.FirstName, item.LastName].join(' ').trim()} fallback={initials([item.FirstName, item.LastName].join(' ').trim()).slice(0, 2)} />
              <div className="flex w-full max-w-full flex-1 flex-col overflow-hidden">
                <h3 className="my-auto w-[97%] overflow-hidden text-ellipsis whitespace-nowrap text-sm font-normal">{[item.FirstName, item.LastName].join(' ').trim()}</h3>
                <div className="mt-1.5">
                  {/* {item.groupData?.name && (
                    <div className="mb-1 flex gap-1 text-muted-foreground">
                      <RiMapPin2Line size={15} />
                      <p className="my-auto w-[97%] space-x-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-normal text-muted-foreground">
                        <span>{item.groupData?.name || 'No Region'}</span>
                      </p>
                    </div>
                  )} */}
                  {item.BusinessTypeName && (
                    <div className="flex gap-1 text-muted-foreground">
                      <RiNewsLine size={15} />
                      <p className="my-auto w-[97%] space-x-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-normal text-muted-foreground">
                        <span>{item.BusinessTypeName}</span>
                        <span className="mt-1">•</span>
                        <span>{[item.FirstName, item.LastName].join(' ').trim()}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </NextLink>
        ))}
    </DialogContent>
  </Dialog>
);

export default ProfileListDialog;
