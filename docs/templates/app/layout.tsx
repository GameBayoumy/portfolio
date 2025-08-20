import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Orbitron } from 'next/font/google';
import { Suspense } from 'react';

import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ToastProvider } from '@/components/providers/toast-provider';
import { PerformanceMonitor } from '@/components/performance/performance-monitor';
import { LoadingScreen } from '@/components/ui/loading-screen';

import './globals.css';

// Font configurations
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

// Metadata configuration
export const metadata: Metadata = {
  title: {
    default: 'XR Developer Portfolio',
    template: '%s | XR Portfolio',
  },
  description: 'Immersive XR developer portfolio showcasing cutting-edge WebXR experiences',
  keywords: [
    'XR Developer',
    'WebXR',
    'Three.js',
    'React Three Fiber',
    'Virtual Reality',
    'Augmented Reality',
    'Portfolio',
    'Interactive 3D',
  ],
  authors: [{ name: 'XR Developer' }],
  creator: 'XR Developer',
  publisher: 'XR Developer',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    siteName: 'XR Developer Portfolio',
    title: 'XR Developer Portfolio',
    description: 'Immersive XR developer portfolio showcasing cutting-edge WebXR experiences',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'XR Developer Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XR Developer Portfolio',
    description: 'Immersive XR developer portfolio showcasing cutting-edge WebXR experiences',
    images: ['/og-image.jpg'],
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
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: 'cover',
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

// Root layout component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html
      lang='en'
      className={cn(
        'antialiased scroll-smooth',
        inter.variable,
        jetBrainsMono.variable,
        orbitron.variable
      )}
      suppressHydrationWarning
    >
      <head>
        <meta name='color-scheme' content='dark light' />
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-sans text-foreground',
          'selection:bg-primary/20 selection:text-primary-foreground'
        )}
      >
        <ThemeProvider
          attribute='class'
          defaultTheme='dark'
          enableSystem
          disableTransitionOnChange={false}
        >
          <div className='relative flex min-h-screen flex-col'>
            {/* Background grid pattern */}
            <div className='fixed inset-0 -z-10 h-full w-full bg-background bg-cyber-grid bg-grid opacity-40' />
            
            {/* Main content */}
            <Suspense fallback={<LoadingScreen />}>
              {children}
            </Suspense>
            
            {/* Performance monitoring in development */}
            {process.env.NODE_ENV === 'development' && 
             process.env.NEXT_PUBLIC_ENABLE_DEBUG_MODE === 'true' && (
              <PerformanceMonitor />
            )}
          </div>
          
          {/* Toast notifications */}
          <ToastProvider />
        </ThemeProvider>
        
        {/* Analytics scripts */}
        {process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true' && (
          <>
            {/* Google Analytics */}
            {process.env.NEXT_PUBLIC_GA_TRACKING_ID && (
              <>
                <script
                  async
                  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_TRACKING_ID}`}
                />
                <script
                  dangerouslySetInnerHTML={{
                    __html: `
                      window.dataLayer = window.dataLayer || [];
                      function gtag(){dataLayer.push(arguments);}
                      gtag('js', new Date());
                      gtag('config', '${process.env.NEXT_PUBLIC_GA_TRACKING_ID}');
                    `,
                  }}
                />
              </>
            )}
          </>
        )}
      </body>
    </html>
  );
}