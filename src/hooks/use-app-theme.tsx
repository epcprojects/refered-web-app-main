import { AppTheme } from '@/constants/app-theme.constants';
import { useTheme } from 'next-themes';
import { useMemo } from 'react';
import { IconType } from 'react-icons/lib';
import { LuMoon, LuSun } from 'react-icons/lu';

export interface IThemeConfig {
  theme: AppTheme;
  toggleTheme: () => void;
  currentThemeIcon: IconType;
}

export const useAppTheme = (): IThemeConfig => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const is = (target: AppTheme) => Boolean(resolvedTheme === target);
  const getCurrentThemeIcon = () => (is(AppTheme.light) ? LuSun : LuMoon); // (is(AppTheme.system) ? LuMonitor : is(AppTheme.light) ? LuSun : LuMoon);
  const toggleTheme = () => setTheme(is(AppTheme.light) ? AppTheme.dark : AppTheme.light); // setTheme(is(AppTheme.system) ? AppTheme.light : is(AppTheme.light) ? AppTheme.dark : AppTheme.system);

  const currentThemeIcon = useMemo(() => getCurrentThemeIcon(), [theme]);

  return {
    theme: resolvedTheme as AppTheme,
    toggleTheme,
    currentThemeIcon,
  };
};
