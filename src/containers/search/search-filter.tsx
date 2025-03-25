import { StateCitySelectIndependent } from '@/components/form/state-city-select';
import { Button } from '@/components/ui/button';

import { RiFilter2Line } from 'react-icons/ri';

import { Form } from '@/components/form';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { filterFormSchemaType } from '.';

interface ICommonProps {
  form: UseFormReturn<filterFormSchemaType>;
}

interface IFilterButtonProps extends ICommonProps {
  toggleOpen?: () => void;
}

export const FilterButton: React.FC<IFilterButtonProps> = ({ toggleOpen, form }) => {
  const isTriggered = Boolean(form.watch('cities') || form.watch('states'));

  return (
    <Button variant={'background'} onClick={toggleOpen} classes={{ container: `relative w-9 rounded-full ${isTriggered ? 'bg-primary' : ''}` }}>
      <RiFilter2Line size={15} />
      {isTriggered && <div className="absolute right-0 top-0 h-[10px] w-[10.5px] rounded-full border-1 border-white bg-black"></div>}
    </Button>
  );
};

interface ISearchFilters extends ICommonProps {
  className?: string;
}

export function SearchFilters({ form, className = '' }: ISearchFilters) {
  const city = form.watch('cities');
  const state = form.watch('states');

  const handleClearAllFilters = () => {
    form.reset();
  };

  return (
    <Form form={form} className={'mt-2 flex gap-3 ' + className}>
      <StateCitySelectIndependent form={form} />
      {city && state ? (
        <Button variant={'background'} onClick={handleClearAllFilters}>
          Clear
        </Button>
      ) : null}
    </Form>
  );
}
