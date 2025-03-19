import RootLayoutIndex from '@/layouts/root-layout';
import '@/styles/globals.scss';
import type { Metadata, Viewport } from 'next';

interface IProps {
  children: React.ReactNode;
}

const RootLayout: React.FC<IProps> = ({ children }) => (
    <RootLayoutIndex>{children}</RootLayoutIndex>
);
export default RootLayout;
export const metadata: Metadata = {
  title: 'Refered',
  description: 'Refered web app built using Next.js',
};
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: false,
};
