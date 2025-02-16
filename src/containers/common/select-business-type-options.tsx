'use client';

import EmptyList from '@/components/common/empty-list';
import { Form } from '@/components/form';
import FieldButton from '@/components/form/field-button';
import FieldInput from '@/components/form/field-input';
import AuthCardLayout from '@/components/layout/auth-card-layout';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { GetAllBusinessTypes, IBusinessType } from '@/firebase/business-types';
import { cn } from '@/utils/cn.utils';
import { asyncGuard } from '@/utils/lodash.utils';
import { generateUUID } from '@/utils/misc.utils';
import { useDebounceValue } from '@/utils/use-hooks.utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { RiCheckboxCircleFill, RiSearchLine } from 'react-icons/ri';
import { toast } from 'sonner';
import { z } from 'zod';

interface IProps {
  handleGoBack: () => void;
  selectedOption: { label: string; value: string } | null;
  handleSelectOption: (option: { label: string; value: string }) => void;
  notForAuthPage?: boolean;
}

export type businessOptionsSchemaType = z.infer<typeof businessOptionsSchema>;
export const businessOptionsSchema = z.object({
  category: z.string(),
});

const SelectBusinessTypeOptions: React.FC<IProps> = ({ handleSelectOption, selectedOption, handleGoBack, notForAuthPage }) => {
  const [isFetching, setIsFetching] = useState(false);
  const [other, setOther] = useState(false);
  const [allOptions, setAllOptions] = useState<IBusinessType[]>([]);
  const [filteredOptions, setFilteredOptions] = useState<IBusinessType[]>([]);
  const [debouncedSearchTerm, setSearchTerm] = useDebounceValue('', 500);

  const form = useForm<businessOptionsSchemaType>({ resolver: zodResolver(businessOptionsSchema) });

  const onSubmit = async (values: businessOptionsSchemaType) => {
    if (!values.category) return;

    const userAddedBusiness: IBusinessType = {
      id: generateUUID(),
      name: values.category,
      description: '',
    };

    setFilteredOptions((prev) => [...prev, userAddedBusiness]);
  };

  const handleFetchData = async () => {
    setIsFetching(true);
    const response = await asyncGuard(() => GetAllBusinessTypes());
    if (response.error !== null || response.result === null) toast.error(response.error?.toString() || 'Something went wrong!');
    else {
      setAllOptions(response.result);
      setFilteredOptions(response.result);
    }
    setIsFetching(false);
  };

  useEffect(() => {
    const filtered = allOptions.filter((item) => item.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || item.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
    setFilteredOptions(filtered);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    handleFetchData();
  }, []);

  return (
    <AuthCardLayout title="Select Business" onBack={handleGoBack} containerClassName="gap-2" coverImageSrc="/images/auth-cover-03.jpg" notForAuthPage={notForAuthPage}>
      {isFetching ? (
        <Spinner container="fullWidth" color="secondary" size="md" />
      ) : (
        <>
          <Input onChange={(e) => setSearchTerm(e.currentTarget.value)} leftElement={<RiSearchLine className="mb-0.5" />} placeholder="Search" />
          {filteredOptions.length <= 0 ? (
            <EmptyList type="noDataFound" />
          ) : (
            <>
              {filteredOptions.map((item) => (
                <div key={item.id} className="group flex w-full cursor-pointer flex-row gap-1 rounded-md bg-background px-3 py-2.5" onClick={() => handleSelectOption({ label: item.name, value: item.id })}>
                  <div className="flex flex-1 flex-col gap-0">
                    <h3 className="text-sm font-semibold">{item.name}</h3>
                    <p className="text-xs">{item.description}</p>
                  </div>
                  <RiCheckboxCircleFill size={20} className={cn('my-auto flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-20', item.id === selectedOption?.value && '!opacity-100')} />
                </div>
              ))}
            </>
          )}

          {/* Other */}
          <div key={'other_business_opt'} className="group flex w-full cursor-pointer flex-row gap-1 rounded-md bg-background px-3 py-2.5" onClick={() => setOther(!other)}>
            <div className="flex flex-1 flex-col gap-0">
              <h3 className="text-sm font-semibold">Other</h3>
            </div>
            <RiCheckboxCircleFill size={20} className={cn('my-auto flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-20', other && '!opacity-100')} />
          </div>

          {other && (
            <Form form={form} onSubmit={onSubmit} className="grid w-full gap-2.5">
              <div className="relative border-solid">
                <FieldInput form={form} name="category" placeholder="Enter Category" className="w-[calc(100%-60px)] border-gray-300" containerClassName="h-[50px] bg-transparent border-gray-300" />
                <FieldButton
                  form={form}
                  type="submit"
                  label="Add"
                  variant="secondary"
                  style={{
                    position: 'absolute',
                    top: 7,
                    right: 7,
                  }}
                />
              </div>
            </Form>
          )}
        </>
      )}
    </AuthCardLayout>
  );
};

export default SelectBusinessTypeOptions;
