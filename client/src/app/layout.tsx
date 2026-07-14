import type { Metadata, Viewport } from 'next';
import Header from '@/components/layout/Header';
import './globals.scss';

export const metadata: Metadata = {
  title: 'Support Ticket System',
  description: 'Internal support ticket management',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 1rem' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
