import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'PMVerse | The Product Management Universe',
  description: 'Join PMVerse — The all-in-one ecosystem for Product Managers. Community discussions, AI Copilot, verified PM jobs, and diagnostic assessments.',
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
      <body className="antialiased selection:bg-purple-600 selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
