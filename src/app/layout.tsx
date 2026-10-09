import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'PMVerse | Modern Product Management Network & Intelligence',
  description: 'The premier career and competency platform for Product Managers. AI Mentor, 50-Question PM Competency Diagnostic, verified Job Board, Community, and Knowledge Hub.',
  icons: {
    icon: '/pmverse-icon.png',
    apple: '/pmverse-icon.png',
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
