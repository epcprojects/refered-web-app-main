'use client';

import AppPageLayout from '@/components/layout/app-page-layout';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GetAllFaqs, IFaqType } from '@/firebase/faqs';
import { cn } from '@/utils/cn.utils';
import { asyncGuard } from '@/utils/lodash.utils';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface IProps {}

const tabs = [
  { label: 'User', value: 'user' as const },
  { label: 'Business', value: 'business' as const },
];

const FaqsIndex: React.FC<IProps> = () => {
  const [data, setData] = useState<{ user: IFaqType[]; business: IFaqType[] }>({ user: [], business: [] });
  const [isFetchingData, setIsFetchingData] = useState(false);

  const handleFetchData = async () => {
    setIsFetchingData(true);
    const response = await asyncGuard(() => GetAllFaqs());
    if (response.error !== null || response.result === null) toast.error(response.error?.toString() || 'Something went wrong!');
    else setData(response.result);
    setIsFetchingData(false);
  };

  useEffect(() => {
    handleFetchData();
  }, []);

  return (
    <AppPageLayout title="FAQs" isLoading={isFetchingData}>
      <Tabs defaultValue={tabs[0].value} className="w-full">
        <TabsList className="grid h-10 w-full grid-cols-2">
          {tabs.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((item) => (
          <TabsContent key={item.value} value={item.value}>
            <Accordion type="multiple" className="w-full">
              {data[item.value].map((faq, index) => (
                <AccordionItem key={faq.id} value={faq.id} className={cn(index === data[item.value].length - 1 && 'border-0')}>
                  <AccordionTrigger className="px-2 transition-colors hover:bg-slate-50">{faq.question}</AccordionTrigger>
                  <AccordionContent className="px-2">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>
        ))}
      </Tabs>
    </AppPageLayout>
  );
};

export default FaqsIndex;
