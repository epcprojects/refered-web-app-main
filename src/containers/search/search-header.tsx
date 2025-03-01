import { Form } from '@/components/form';
import { Input } from '@/components/ui/input';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { LuX } from 'react-icons/lu';
import { RiArrowLeftSLine, RiSearchLine } from 'react-icons/ri';
import { FilterButton, SearchFilters } from './search-filter';

interface ICommonProps {
  form: UseFormReturn<any>;
  showBackButton: boolean;
  searchTerm: string;
  handleGoBack: () => void;
  setSearchTerm: (val: string) => void;
  setShowSearchFilter?: () => void;
  showSearchFilter?: boolean;
}

export function SearchHeader({ showBackButton, searchTerm, handleGoBack, setSearchTerm, setShowSearchFilter, showSearchFilter, form }: ICommonProps) {
  const handleResetSearch = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    setSearchTerm('');
  };

  return (
    <Form form={form}>
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
        <FilterButton form={form} toggleOpen={setShowSearchFilter} />
      </div>
      <SearchFilters form={form} className={showSearchFilter ? '' : 'hidden'} />
    </Form>
  );
}
