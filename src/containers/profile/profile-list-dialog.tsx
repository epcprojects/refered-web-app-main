import Avatar from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { IFavorite } from '@/firebase/favorite';
import { initials } from '@/utils/lodash.utils';

import { RiMapPin2Line, RiNewsLine } from 'react-icons/ri';

interface IProps {
  count?: number;
  data?: IFavorite[];
  shade?: 'dark' | 'light';
  trigger?: React.ReactNode;
  triggerClass?: string;
  dialogTitle?: string;
  showDialog?: boolean;
  dialogLoading?: boolean;
  onUserClick?: (user: IFavorite) => Promise<void>;
}

const ProfileListDialog: React.FC<IProps> = ({ count = 0, triggerClass = '', data, shade = 'light', dialogTitle = "Refer'd by", showDialog = true, dialogLoading = false, onUserClick = () => void 0, trigger }) => (
  <Dialog>
    <DialogTrigger
      onClick={(e) => {
        e.stopPropagation();
      }}
      className={triggerClass + ' text-start'}
    >
      {trigger ??
        (count > 0 && (
          <div className={`flex cursor-pointer items-center gap-1 rounded-full border-1 border-border ${shade === 'dark' ? 'border-black border-opacity-15' : ''} p-[3px] transition-all hover:bg-slate-100`}>
            <span className="mr-0.5 w-max max-w-16 overflow-hidden text-ellipsis whitespace-nowrap text-[11px] 2xs:max-w-10 xs:max-w-18">+ {count}</span>
          </div>
        ))}
    </DialogTrigger>
    {showDialog && !!data?.length && (
      <DialogContent style={{ background: '#FFFFFF' }}>
        <DialogTitle>{dialogTitle}</DialogTitle>
        {dialogLoading ? (
          <Spinner />
        ) : (
          data.map((item) => (
            <button type="button" onClick={() => onUserClick(item)} key={item.id} className="flex w-full cursor-pointer flex-row items-center justify-between rounded-md p-2 transition-colors hover:bg-background/80">
              <div className="flex w-full max-w-full flex-row gap-3 overflow-hidden">
                <Avatar src={item.ImageUrl} alt={[item.FirstName, item.LastName].join(' ').trim()} fallback={initials([item.FirstName, item.LastName].join(' ').trim()).slice(0, 2)} />
                <div className="flex w-full max-w-full flex-1 flex-col overflow-hidden text-left">
                  <h3 className="my-auto w-[97%] overflow-hidden text-ellipsis whitespace-nowrap text-sm font-normal">{[item.FirstName, item.LastName].join(' ').trim()}</h3>
                  <div className="mt-1.5">
                    {item.City && item.State && (
                      <div className="mb-1 flex gap-1 text-muted-foreground">
                        <RiMapPin2Line size={15} />
                        <p className="my-auto w-[97%] space-x-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-normal text-muted-foreground">
                          <span>{item.City + ', ' + item.State || 'No Region'}</span>
                        </p>
                      </div>
                    )}
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
            </button>
          ))
        )}
      </DialogContent>
    )}
  </Dialog>
);

export default ProfileListDialog;
