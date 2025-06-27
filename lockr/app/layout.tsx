import { Providers } from '@/components/Providers';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'LOCKR - Site & App Blocker',
  description: 'A cross-platform focus tool that blocks distracting websites and apps.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
