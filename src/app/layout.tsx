import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  metadataBase: new URL('https://pmverse.in'),
  title: 'PMVerse | Modern Product Management Network & Intelligence',
  description: 'The premier career and competency platform for Product Managers. AI Mentor, 50-Question PM Competency Diagnostic, verified Job Board, Community, and Knowledge Hub.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.png', type: 'image/png' },
      { url: '/pmverse-icon.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/pmverse-icon.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'PMVerse | Modern Product Management Network & Intelligence',
    description: 'The premier career and competency platform for Product Managers. AI Mentor, 50-Question PM Competency Diagnostic, verified Job Board, Community, and Knowledge Hub.',
    url: 'https://pmverse.in',
    siteName: 'PMVerse',
    images: [
      {
        url: '/pmverse-logo.png',
        width: 400,
        height: 100,
        alt: 'PMVerse Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#f3f2f2] text-[#201e1d]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
