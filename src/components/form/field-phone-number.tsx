'use client';

import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Countries, Country, handleGetCountryImgSrc } from '@/constants/countries.constants';
import { cn } from '@/utils/cn.utils';
import clsx from 'clsx';
import debounce from 'lodash/debounce';
import Image from 'next/image';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { FieldError, FieldValues, Path, PathValue, UseFormReturn } from 'react-hook-form';
import { LuCheck, LuSearch } from 'react-icons/lu';
import { FormField } from '.';

interface IProps<T extends FieldValues> {
  form: UseFormReturn<T, any, undefined>;
  name: Path<T>;
  placeholder?: string;
  selectedCountry: Country;
  setSelectedCountry: Dispatch<SetStateAction<Country>>;
}

function FieldPhoneNumber<T extends FieldValues>({ form, name, placeholder, selectedCountry, setSelectedCountry }: IProps<T>) {
  const [searchCountry, setSearchCountry] = useState('');
  const [filteredCountries, setFilteredCountries] = useState<Country[]>(Countries.map((item) => item));
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleDebouncedSearch = debounce((term: string) => setFilteredCountries(Countries.filter((item) => item.name.toLowerCase().includes(term.toLowerCase()) || item.phoneCode.toLowerCase().includes(term.toLowerCase()))), 300);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchCountry(e.target.value);
    handleDebouncedSearch(e.target.value);
  };

  const handleSelectCountry = (targetCountry: Country) => {
    setSelectedCountry(targetCountry);
    form.setValue(name as Path<T>, '' as PathValue<T, Path<T>>);
    setIsPopoverOpen(false);
  };

  return (
    <FormField form={form} register={form.register(name)} labelConfig={{ hideLabel: true }} errorConfig={{ className: '-bottom-[1rem]' }}>
      {(field) => (
        <div className="flex flex-row gap-2">
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger className={cn('flex h-9 min-w-9 flex-shrink-0 items-center justify-center rounded-md border-1 border-transparent bg-background px-3 text-[14px]', !!form.formState.errors[name] && 'border-destructive')}>{`+${selectedCountry.phoneCode}`}</PopoverTrigger>
            <PopoverContent align="start" className="relative bg-card p-0">
              <Input placeholder="Search Country..." value={searchCountry} containerClassName="bg-transparent border-0 px-4 py-2.5" onChange={handleSearch} leftElement={<LuSearch size={17} className="shrink-0 self-center opacity-40" />} />
              <Separator />
              <div className="max-h-32 overflow-y-auto p-1">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => (
                    <div className="flex cursor-pointer flex-row items-center gap-1 rounded-sm p-1 hover:bg-background" key={country.name} onClick={() => handleSelectCountry(country)}>
                      <Image src={handleGetCountryImgSrc(country.countryCode)} alt={`${country.name} Flag`} width={15} height={15} />
                      <p className="mx-1 flex-1 text-[14px]">{country.name}</p>
                      <LuCheck className={clsx('mr-2 h-4 w-4', selectedCountry.name === country.name ? 'opacity-100' : 'opacity-0')} />
                    </div>
                  ))
                ) : (
                  <p className="px-2 py-4 text-center text-[14px]">No country found.</p>
                )}
              </div>
            </PopoverContent>
          </Popover>
          <Input placeholder={placeholder || selectedCountry.placeholder || 'Phone Number'} mask={selectedCountry.format} error={form.formState.errors[name] as FieldError | undefined} containerClassName="flex-1" {...field} />
        </div>
      )}
    </FormField>
  );
}

export default FieldPhoneNumber;
export const handleCompilePhoneNumber = (phoneNumber: string | null | undefined, phoneNumberField: ReturnType<typeof usePhoneNumberField>) => (!!phoneNumber ? `${phoneNumberField.selectedCountry.phoneCode} ${phoneNumber}` : '');
export const handleDeCompilePhoneNumber = (phoneNumber: string | null | undefined) => (!!phoneNumber ? phoneNumber.substring(phoneNumber.indexOf(' ') + 1) : '');
export const handleDeCompilePhoneNumberCountryCode = (phoneNumber: string | null | undefined) => {
  const defaultPhoneCode = phoneNumber?.split(' ')[0].trim() || Countries.find((item) => item.countryCode === 'us')?.phoneCode;
  const countriesWithThisPhoneCode = Countries.filter((item) => item.phoneCode === defaultPhoneCode);

  if (!!phoneNumber === false) return Countries.find((item) => item.countryCode === 'us') || Countries[0];
  else if (countriesWithThisPhoneCode.length <= 0) return Countries[0];
  else if (countriesWithThisPhoneCode.length === 1) return countriesWithThisPhoneCode[0];
  else {
    countriesWithThisPhoneCode.sort((a, b) => (a.orderPriority || 0) - (b.orderPriority || 0));
    if (countriesWithThisPhoneCode[0].countryCode === 'us' && (Countries.find((item) => item.countryCode === 'ca')?.areaCodes || []).includes(phoneNumber?.split(' ')[1].replace('(', '').replace(')', '') || '-1')) return Countries.find((item) => item.countryCode === 'ca') || countriesWithThisPhoneCode[0];
    return countriesWithThisPhoneCode[0];
  }
};
export const usePhoneNumberField = (phoneNum?: string | null) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(() => (!!phoneNum === false ? handleDeCompilePhoneNumberCountryCode(phoneNum) : Countries.find((item) => item.countryCode === 'us') || Countries[0]));
  const updatePhoneNumber = (phone: string | null | undefined) => setSelectedCountry(handleDeCompilePhoneNumberCountryCode(phone));

  useEffect(() => {
    updatePhoneNumber(phoneNum);
  }, [phoneNum]);

  return { selectedCountry, setSelectedCountry };
};
