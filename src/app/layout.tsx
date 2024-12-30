import { Metadata, Viewport } from 'next';
import RootLayoutClient from './layout_client';
import { LanguageProvider } from './context/LanguageContext'
import { ThemeProvider } from './context/ThemeContext'
import { ScreenProvider } from './context/ScreenContext'

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
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <ThemeProvider>
            <ScreenProvider>
              <RootLayoutClient>
                {children}
              </RootLayoutClient>
            </ScreenProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}