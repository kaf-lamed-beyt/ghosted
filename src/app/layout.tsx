import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '👻 Ghosted',
  icons: '/ghosted.png',
  twitter: {
    card: 'summary_large_image',
    images: '/ghosted.png',
    title: 'Ghosted',
    site: 'ghostd.dev',
    description: 'Find out when someone follows or unfollows you on GitHub',
  },
  openGraph: {
    type: 'website',
    siteName: 'ghostd.dev',
    title: 'Ghosted',
    description: 'Find out when someone follows or unfollows you on GitHub',
    images: ['/ghosted.png'],
  },
  description: 'Find out when someone follows or unfollows you on GitHub',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Providers>
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                color: 'var(--color-white)',
                background: 'var(--color-heavy-grey)',
                border: '1px solid var(--color-alt-white)',
              },
            }}
          />
        </body>
      </Providers>
    </html>
  );
}
