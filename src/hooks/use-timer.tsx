'use client';

import { useCountdown } from '@/utils/use-hooks.utils';
import { useEffect, useState } from 'react';

interface IProps {
  start: number;
  stop: number;
  intervalMs?: number;
}

export const useTimer = ({ start, stop, intervalMs = 1000 }: IProps) => {
  const [countdown, { startCountdown, stopCountdown, resetCountdown }] = useCountdown({ countStart: start, countStop: stop, intervalMs: intervalMs, isIncrement: start < stop });
  const [inProgress, setInProgress] = useState(false);

  const handleRestartTimer = () => {
    setInProgress(true);
    resetCountdown();
    startCountdown();
  };

  useEffect(() => {
    if (countdown === stop) setInProgress(false);
  }, [countdown]);

  return { count: countdown, inProgress: inProgress, restart: handleRestartTimer };
};
