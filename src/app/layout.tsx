import { Metadata } from 'next';
import RootLayoutClient from './layout_client';

export const metadata: Metadata = {
  title: 'VNA Tech',
  description: 'Giải pháp công nghệ thông minh VNA Tech',
  authors: [{ name: 'QUEEN' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RootLayoutClient>{children}</RootLayoutClient>;
}