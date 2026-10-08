import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Food Atlas: How ingredients reached India',
  description:
    'An editorial cartographic instrument tracing the historical movement of food across continents and into India over five millennia.',
  icons: {
    icon: [
      {
        url: '/leaf.svg',
        type: 'image/svg+xml',
      },
    ],
    shortcut: '/leaf.svg',
    apple: '/leaf.svg',
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
        <link rel="icon" href="/leaf.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/leaf.svg" />
      </head>
      <body className="min-h-screen bg-[#f6f7f9] text-neutral-900 antialiased selection:bg-accent selection:text-white overflow-hidden">
        {children}
      </body>
    </html>
  );
}
