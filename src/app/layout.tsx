import { Metadata, Viewport } from 'next';
import RootLayoutClient from './layout_client';

export const metadata: Metadata = {
  title: 'VNA Tech',
  description: 'Giải pháp công nghệ thông minh VNA Tech',
  authors: [{ name: 'QUEEN' }],
  robots: 'index, follow',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RootLayoutClient>{children}</RootLayoutClient>;
}