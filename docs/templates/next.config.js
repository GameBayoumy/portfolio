/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for better performance
  experimental: {
    // Enable optimized loading for 3D assets
    optimizePackageImports: ['three', '@react-three/fiber', '@react-three/drei'],
    // Enable turbopack for faster development builds
    turbo: {
      rules: {
        '*.glb': {
          loaders: ['file-loader'],
          as: '*.glb'
        },
        '*.gltf': {
          loaders: ['file-loader'],
          as: '*.gltf'
        }
      }
    }
  },

  // Optimize images and assets
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Enable strict mode for better development experience
  reactStrictMode: true,

  // Enable SWC minification for better performance
  swcMinify: true,

  // Compress responses
  compress: true,

  // Configure webpack for 3D assets and optimizations
  webpack: (config, { isServer, dev }) => {
    // Handle 3D model files
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/models/[name].[hash][ext]',
      },
    });

    // Handle audio files
    config.module.rules.push({
      test: /\.(mp3|wav|ogg)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/audio/[name].[hash][ext]',
      },
    });

    // Optimize three.js bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    // Enable production optimizations
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        sideEffects: false,
      };
    }

    return config;
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Configure static file serving
  async rewrites() {
    return [
      {
        source: '/models/:path*',
        destination: '/api/models/:path*',
      },
    ];
  },

  // Enable bundle analyzer in analyze mode
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, options) => {
      const { BundleAnalyzerPlugin } = require('@next/bundle-analyzer')();
      config.plugins.push(new BundleAnalyzerPlugin());
      return config;
    },
  }),

  // Performance optimizations
  poweredByHeader: false,
  generateEtags: false,
  
  // Environment variables that should be available on the client
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

module.exports = nextConfig;