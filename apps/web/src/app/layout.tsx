import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';
import { DemoBanner } from '@/components/ui/DemoBanner';

export const metadata: Metadata = {
  title: 'VedaAI – AI Assessment Creator',
  description: 'Generate intelligent question papers with AI. Built for educators.',
  icons: { icon: '/logo.svg' },
  openGraph: {
    title: 'VedaAI – AI Assessment Creator',
    description: 'Generate intelligent question papers with AI.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const isDemo = !process.env.ANTHROPIC_API_KEY
    || process.env.ANTHROPIC_API_KEY === 'demo'
    || process.env.ANTHROPIC_API_KEY.startsWith('demo-');

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ToastProvider>
          {isDemo && <DemoBanner />}
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
