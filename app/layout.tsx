import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'RentAgenda Marketplace — Find your next property',
    template: '%s | RentAgenda Marketplace',
  },
  description:
    'Browse apartments, houses, villas, offices, and vacation rentals. Published directly by verified property owners.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-slate-900 antialiased`}>
        <Header />
        <main className="min-h-[calc(100vh-56px-theme(spacing.16))]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
