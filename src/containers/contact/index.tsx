'use client';

import { Form } from '@/components/form';
import FieldButton from '@/components/form/field-button';
import FieldInput from '@/components/form/field-input';
import FieldTextarea from '@/components/form/field-textarea';
import AppPageLayout from '@/components/layout/app-page-layout';
import { SubmitContact } from '@/firebase/contact';
import { useAppStore } from '@/hooks/use-app-store';
import { asyncGuard } from '@/utils/lodash.utils';
import { ZOD } from '@/utils/zod.utils';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface IProps {}

export type contactFormSchemaType = z.infer<typeof contactFormSchema>;
export const contactFormSchema = z.object({
  subject: z.string({ required_error: ZOD.ERROR.REQUIRED() }), //.refine((value) => AppRegex.NO_CODE_ALLOWED.test(value), { message: ZOD.ERROR.NO_CODE_ALLOWED() }),
  message: z.string({ required_error: ZOD.ERROR.REQUIRED() }), //.refine((value) => AppRegex.NO_CODE_ALLOWED.test(value), { message: ZOD.ERROR.NO_CODE_ALLOWED() }),
});

const ContactIndex: React.FC<IProps> = () => {
  const globalStore = useAppStore('Global');

  const form = useForm<contactFormSchemaType>({ resolver: zodResolver(contactFormSchema) });

  const onSubmit = async (values: contactFormSchemaType) => {
    if (globalStore === null || globalStore.currentUser === null) return;
    const currentUser = globalStore.currentUser;
    const response = await asyncGuard(() => SubmitContact({ subject: values.subject, message: values.message, userId: currentUser.uid }));
    if (response.error !== null || response.result === null) toast.error(response.error?.toString() || 'Something went wrong!');
    else {
      form.reset({ subject: '', message: '' });
      toast.success('Submitted successfully!');
    }
  };

  return (
    <AppPageLayout title="Contact Us">
      <Form form={form} onSubmit={onSubmit} className="grid w-full gap-2.5">
        <FieldInput form={form} name="subject" placeholder="Subject" />
        <FieldTextarea form={form} name="message" placeholder="Message" className="h-40" />
        <FieldButton form={form} type="submit" label="Submit" variant="secondary" />
      </Form>
    </AppPageLayout>
  );
};

export default ContactIndex;
