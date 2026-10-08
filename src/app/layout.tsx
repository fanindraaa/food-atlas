import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const getSiteUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    const url = process.env.NEXT_PUBLIC_SITE_URL;
    return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
};

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: 'The Food Atlas: How the Indian Pantry Came Together',
  description:
    'Explore how the Indian pantry came together. Trace 150 ingredients across 5,000+ years to discover what was native, what arrived from elsewhere, and how it shaped Indian cuisine.',
  icons: {
    icon: [
      {
        url: '/light.svg',
        type: 'image/svg+xml',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/dark.svg',
        type: 'image/svg+xml',
        media: '(prefers-color-scheme: dark)',
      },
    ],
    shortcut: '/light.svg',
    apple: '/light.svg',
  },
  openGraph: {
    title: 'The Food Atlas: How the Indian Pantry Came Together',
    description:
      'Explore how the Indian pantry came together. Trace 150 ingredients across 5,000+ years to discover what was native, what arrived from elsewhere, and how it shaped Indian cuisine.',
    url: '/',
    siteName: 'The Food Atlas',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Food Atlas: How the Indian Pantry Came Together',
    description:
      'Explore how the Indian pantry came together. Trace 150 ingredients across 5,000+ years to discover what was native, what arrived from elsewhere, and how it shaped Indian cuisine.',
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
        <link rel="icon" href="/light.svg" type="image/svg+xml" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/dark.svg" type="image/svg+xml" media="(prefers-color-scheme: dark)" />
        <link rel="apple-touch-icon" href="/light.svg" />
      </head>
      <body className="min-h-screen bg-[#f6f7f9] text-neutral-900 antialiased selection:bg-accent selection:text-white overflow-hidden">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
