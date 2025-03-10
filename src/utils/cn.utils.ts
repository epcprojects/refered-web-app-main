// eslint-disable-next-line no-restricted-imports
import { type ClassValue, clsx } from 'clsx';
// eslint-disable-next-line no-restricted-imports
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
