import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Yaharika Mart — One Neighborhood. Many Stores. Zero Lost Sales.',
    template: '%s | Yaharika Mart',
  },
  description:
    'Yaharika Mart is a collaborative neighborhood commerce platform where merchants share stock, absorb demand spikes, and jointly serve customers so no sale is ever lost to "out of stock".',
  keywords: ['hyperlocal', 'neighborhood', 'grocery', 'collaborative commerce', 'stock swap', 'Bengaluru'],
  openGraph: {
    title: 'Yaharika Mart — One Neighborhood. Many Stores. Zero Lost Sales.',
    description: 'Shop locally, save more. Shops near you work together so nothing is ever out of stock.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
