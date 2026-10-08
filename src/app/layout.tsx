import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ProdCraft | The Ultimate Product Manager Hub',
  description: 'Community for Product Managers, AI Term Tutor, Verified PM Job Board, and Career Fit Diagnostic.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
