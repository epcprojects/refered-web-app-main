import FieldSelectDropdown from '@/components/form/field-dropdown';
import { StateKeys, USA_CITY_AND_STATES } from '@/constants/countries.constants';
import React, { useEffect, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface IProps {
  form: UseFormReturn<any>;
}

const StateCitySelect: React.FC<IProps> = ({ form }) => {
  const states = useMemo(() => Object.keys(USA_CITY_AND_STATES).map((state) => ({ label: state, value: state })), []);

  const selectedState = form.watch('states') as StateKeys;
  const selectedCity = form.watch('cities');
  const cities = useMemo(() => {
    return selectedState && USA_CITY_AND_STATES[selectedState] ? USA_CITY_AND_STATES[selectedState].map((city) => ({ label: city, value: city })) : [];
  }, [selectedState]);

  //Upon change the state, we're changing cities.
  useEffect(() => {
    if (selectedState && cities.length) {
      const cityFound = cities.some((val) => val.value === selectedCity);
      form.setValue('cities', cityFound ? selectedCity : cities[0].value);
    }
  }, [selectedState, form]);

  return (
    <div className="grid w-full grid-cols-2 gap-2.5">
      <FieldSelectDropdown form={form} options={states} onChange={(value) => form.setValue('states', value)} value={selectedState} placeholder="State" name="states" containerClassName="border-grey bg-white" />
      <FieldSelectDropdown form={form} options={cities} onChange={(value) => form.setValue('cities', value)} value={selectedCity} placeholder="City" name="cities" containerClassName="border-grey bg-white" />
    </div>
  );
};


export const StateCitySelectIndependent: React.FC<IProps> = ({ form }) => {
  const states = useMemo(() => Object.keys(USA_CITY_AND_STATES).map((state) => ({ label: state, value: state })), []);

  const selectedState = form.watch('states') as StateKeys;
  const selectedCity = form.watch('cities');
  
  const cities = useMemo(()=>{
    if(selectedState){
      return USA_CITY_AND_STATES[selectedState].map((city) => ({ label: city, value: city }));
    }
    return [];
  },[selectedState]);


  return (
    <div className="grid w-full grid-cols-2 gap-2.5">
      <FieldSelectDropdown form={form} options={states} onChange={(value) => form.setValue('states', value)} value={selectedState} placeholder="State" name="states" containerClassName="border-grey bg-white" />
      <FieldSelectDropdown form={form} options={cities} onChange={(value) => form.setValue('cities', value)} value={selectedCity} placeholder="City" name="cities" containerClassName="border-grey bg-white" />
    </div>
  );
};

export default StateCitySelect;
