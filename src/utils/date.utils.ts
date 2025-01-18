/* eslint-disable no-restricted-imports */
import { differenceInDays } from 'date-fns/differenceInDays';
import { differenceInHours } from 'date-fns/differenceInHours';
import { differenceInMinutes } from 'date-fns/differenceInMinutes';
import { differenceInMonths } from 'date-fns/differenceInMonths';
import { differenceInSeconds } from 'date-fns/differenceInSeconds';
import { differenceInWeeks } from 'date-fns/differenceInWeeks';
import { differenceInYears } from 'date-fns/differenceInYears';
import { format } from 'date-fns/format';
import { fromUnixTime } from 'date-fns/fromUnixTime';
import { isSameDay } from 'date-fns/isSameDay';
import { isToday } from 'date-fns/isToday';
import { isYesterday } from 'date-fns/isYesterday';
import { subDays } from 'date-fns/subDays';

const formatDistanceToNow = (date: string | Date) => {
  const now = new Date();
  const targetDate = new Date(date);

  const diffInSeconds = differenceInSeconds(now, targetDate);
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;

  const diffInMinutes = differenceInMinutes(now, targetDate);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = differenceInHours(now, targetDate);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = differenceInDays(now, targetDate);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  const diffInWeeks = differenceInWeeks(now, targetDate);
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`;

  const diffInMonths = differenceInMonths(now, targetDate);
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;

  const diffInYears = differenceInYears(now, targetDate);
  return `${diffInYears}y ago`;
};

const getRelativeDateLabel = (date: string | Date) => {
  const today = new Date();
  const daysBefore = Array.from({ length: 5 }, (_, i) => subDays(today, i + 2));
  if (isToday(date)) return 'Today';
  else if (isYesterday(date)) return 'Yesterday';
  else if (daysBefore.find((day) => isSameDay(date, day))) return format(date, 'EEEE');
  else return format(date, 'MMMM d, yyyy');
};

export const date = {
  format,
  isSameDay,
  formatDistanceToNow,
  getRelativeDateLabel,
  fromUnixTime,
  differenceInDays,
};
