// eslint-disable-next-line no-restricted-imports
import { useMediaQuery } from 'usehooks-ts';

export const useAppResponsive = () => {
  const isExtraSmall = useMediaQuery(`(min-width: 480px)`);
  const isSmall = useMediaQuery(`(min-width: 640px)`);
  const isMedium = useMediaQuery(`(min-width: 768px)`);
  const isLarge = useMediaQuery(`(min-width: 1024px)`);
  const isExtraLarge = useMediaQuery(`(min-width: 1280px)`);
  const isTwoExtraLarge = useMediaQuery(`(min-width: 1536px)`);

  const under = { xs: !isExtraSmall, sm: !isSmall, md: !isMedium, lg: !isLarge, xl: !isExtraLarge, '2xl': !isTwoExtraLarge };
  const over = { xs: isExtraSmall, sm: isSmall, md: isMedium, lg: isLarge, xl: isExtraLarge, '2xl': isTwoExtraLarge };
  return { under, over };
};
