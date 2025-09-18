import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

interface WebAppManifest {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  display: string;
  theme_color: string;
  background_color: string;
  orientation: string;
  scope: string;
  icons: Array<{
    src: string;
    sizes: string;
    type: string;
    purpose?: string;
  }>;
  categories: string[];
  lang: string;
  dir: string;
}

export async function GET(request: NextRequest): Promise<Response> {
  const manifest: WebAppManifest = {
    name: 'Sharif Bayoumy - XR Developer Portfolio',
    short_name: 'Sharif Portfolio',
    description: 'Modern XR Developer Portfolio showcasing 3D visualizations, LinkedIn integration, and GitHub statistics',
    start_url: '/',
    display: 'standalone',
    theme_color: '#000000',
    background_color: '#000000',
    orientation: 'portrait-primary',
    scope: '/',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon-maskable-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['portfolio', 'developer', 'xr', '3d'],
    lang: 'en',
    dir: 'ltr',
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}