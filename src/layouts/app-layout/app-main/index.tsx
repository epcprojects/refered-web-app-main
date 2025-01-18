'use client';

import { useAppResponsive } from '@/hooks/use-app-responsive';
import { cn } from '@/utils/cn.utils';
import React from 'react';

interface IProps {
  children: React.ReactNode;
  mainWidthAndHeightClasses: string;
}

const AppMainIndex: React.FC<IProps> = ({ children, mainWidthAndHeightClasses }) => {
  const responsive = useAppResponsive();

  return (
    <>
      <section className="main-section-width mx-auto h-max min-h-[calc(100dvh-3.5rem)] overflow-hidden bg-card shadow-sm md:min-h-[calc(100dvh-6rem)] md:rounded-xl lg:mx-0">
        <img src="/images/body-top-cutout.svg" alt="Body Top Cutout" className={cn('pointer-events-none fixed -top-5 z-[50] hidden w-[40rem] select-none md:block lg:top-0 lg:w-[32rem]')} />
        <img src="/images/body-top-cutout.svg" alt="Body Top Cutout" className={cn('lg:-bottom-17 pointer-events-none fixed -bottom-[5.5rem] z-[50] hidden w-[40rem] rotate-180 select-none md:block lg:w-[32rem]')} />
        {children}
      </section>
    </>
  );
};

export default AppMainIndex;

// {/* Fixed Masked Overlay with SVG */}
// <div className={cn('pointer-events-none fixed inset-0 z-[40] mx-auto flex items-center justify-center', mainWidthAndHeightClasses)}>
//   <div className="main-fixed-section-width inset-0 h-full">
//     <svg width="100%" height="100%">
//       <defs>
//         <mask id="squareMask">
//           <rect width="100%" height="100%" fill="white" />
//           {/* <rect fill="black" rx={responsive.under.md ? '0' : '6'} ry={responsive.under.md ? '0' : '6'} className="h-full w-full md:h-[calc(100dvh-6rem)] md:translate-y-[20dvh] xl:h-[calc(100dvh-6rem)] xl:translate-y-[8dvh]" /> */}
//           <rect fill="black" rx={responsive.under.md ? '0' : '6'} ry={responsive.under.md ? '0' : '6'} className="h-full w-full md:h-[calc(100dvh-6rem)] md:translate-y-[9dvh]" />
//         </mask>
//       </defs>
//       <rect width="100%" height="100%" mask="url(#squareMask)" className="fill-background" />
//     </svg>
//   </div>
// </div>
