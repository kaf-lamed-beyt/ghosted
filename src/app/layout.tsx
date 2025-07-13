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
  description: 'Followers come and go. Ghosted knows',
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
