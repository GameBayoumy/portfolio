import * as Sentry from '@sentry/nextjs';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Sharif Bayoumy - XR Developer & Computer Scientist',
  description: 'Modern XR developer portfolio showcasing VR/AR projects, 3D experiences, innovative technology solutions, and professional LinkedIn journey.',
  keywords: ['XR Developer', 'VR', 'AR', 'WebXR', 'Three.js', 'Computer Science', 'Game Development', 'LinkedIn', 'Professional Portfolio'],
  authors: [{ name: 'Sharif Bayoumy', url: 'https://sharifbayoumy.nl' }],
  creator: 'Sharif Bayoumy',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://sharifbayoumy.nl',
    title: 'Sharif Bayoumy - XR Developer & Computer Scientist',
    description: 'Modern XR developer portfolio showcasing VR/AR projects, 3D experiences, and innovative technology solutions.',
    siteName: 'Sharif Bayoumy Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sharif Bayoumy - XR Developer & Computer Scientist',
    description: 'Modern XR developer portfolio showcasing VR/AR projects, 3D experiences, and innovative technology solutions.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  other: {
    ...Sentry.getTraceData()
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable
        )}
      >
        <div className="relative flex min-h-screen flex-col">
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}