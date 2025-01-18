import { Input } from '@/components/ui/input';
import React from 'react';
import { LuX } from 'react-icons/lu';
import { RiArrowLeftSLine, RiSearchLine } from 'react-icons/ri';

interface IProps {
  showBackButton: boolean;
  searchTerm: string;
  handleGoBack: () => void;
  setSearchTerm: (val: string) => void;
}

const SearchHeader: React.FC<IProps> = ({ showBackButton, searchTerm, handleGoBack, setSearchTerm }) => {
  const handleResetSearch = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    setSearchTerm('');
  };

  return (
    <div className="flex flex-row items-center gap-2 md:mt-4">
      {!showBackButton ? null : (
        <button onClick={handleGoBack} className="group cursor-pointer">
          <RiArrowLeftSLine size={20} className="transition-all group-hover:-translate-x-0.5" />
        </button>
      )}
      <Input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.currentTarget.value)}
        placeholder="Search"
        containerClassName="rounded-full"
        leftElement={<RiSearchLine className="mb-0.5" />}
        rightElement={
          <>
            {!!searchTerm === false ? null : (
              <button className="cursor-pointer" onClick={handleResetSearch}>
                <LuX />
              </button>
            )}
          </>
        }
      />
    </div>
  );
};

export default SearchHeader;
