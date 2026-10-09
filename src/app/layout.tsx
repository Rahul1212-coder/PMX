import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'ProdIn | The Product Management Network & Platform',
  description: 'The professional network for Product Managers. Community feed, PM network connections, verified PM job board, AI framework tutor, and career fit diagnostics.',
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
      <body className="antialiased selection:bg-[#0a66c2] selection:text-white bg-[#f3f2ef]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
