'use client';

import { AppStores, AppStoresType } from '@/stores';
import { useEffect, useState } from 'react';

export const useAppStore = (type: AppStoresType) => {
  const result = AppStores[type]((state) => state);
  const [data, setData] = useState<null | typeof result>(null);

  useEffect(() => {
    setData(result);
  }, [result]);

  return data;
};
