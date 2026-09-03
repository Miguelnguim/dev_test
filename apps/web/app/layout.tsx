import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/sonner';
import { LanguageProvider } from '@/lib/i18n/language-context';
import './globals.css';

export const metadata: Metadata = {
  title: 'Heyama Objects',
  description: 'Manage your objects effortlessly.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <div className="ambient-glow" aria-hidden="true" />
        <LanguageProvider>
          {children}
          <Toaster position="top-right" richColors />
        </LanguageProvider>
      </body>
    </html>
  );
}
