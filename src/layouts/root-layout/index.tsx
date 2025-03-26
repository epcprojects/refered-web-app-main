import { Toaster } from '@/components/ui/sonner';
import AppAuthProvider from '@/providers/app-auth.provider';
import AppThemeProvider from '@/providers/app-theme.provider';
import AppTooltipProvider from '@/providers/app-tooltip.provider';
import { cn } from '@/utils/cn.utils';
import { Roboto } from 'next/font/google';
import Script from 'next/script';
import NextTopLoader from 'nextjs-toploader';
import React, { Suspense } from 'react';

interface IProps {
  children: React.ReactNode;
}

const roboto = Roboto({ variable: '--font-roboto', subsets: ['latin'], display: 'swap', weight: ['100', '300', '400', '500', '700', '900'] });

const RootLayoutIndex: React.FC<IProps> = ({ children }) => {
  return (
    <html lang="en" className={`${roboto.variable}`}>
      <head>
        <link rel="shortcut icon" href="/favicons/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="57x57" href="/favicons/apple-touch-icon-57x57.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/favicons/apple-touch-icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/favicons/apple-touch-icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/favicons/apple-touch-icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/favicons/apple-touch-icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/favicons/apple-touch-icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/favicons/apple-touch-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon-180x180.png" />
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "qtww6zezrn");
          `}
        </Script>
      </head>
      <body className={cn('flex h-full min-h-page flex-col bg-background text-foreground', roboto.className)}>
        <div id="recaptcha-container" />
        <Suspense>
          <Providers>{children}</Providers>
        </Suspense>
      </body>
    </html>
  );
};

export default RootLayoutIndex;

const Providers: React.FC<IProps> = ({ children }) => {
  return (
    <AppAuthProvider>
      <AppThemeProvider>
        <AppTooltipProvider>
          <Toaster />
          <NextTopLoader color="hsl(var(--primary))" showSpinner={false} />
          {children}
        </AppTooltipProvider>
      </AppThemeProvider>
    </AppAuthProvider>
  );
};
