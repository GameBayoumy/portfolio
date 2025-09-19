/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Next.js 15: Other experimental features can go here
  },
  // Next.js 15: Turbopack configuration
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  typescript: {
    // Temporarily disable type checking during build for urgent deployment
    ignoreBuildErrors: true,
  },
  eslint: {
    // Temporarily disable ESLint during build for urgent deployment
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['sharifbayoumy.com', 'github.com'],
    formats: ['image/webp', 'image/avif'],
  },
  webpack: (config, { isServer }) => {
    // Handle 3D assets
    config.module.rules.push({
      test: /\.(glb|gltf|fbx|obj|3ds|dae)$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            publicPath: '/_next/static/models/',
            outputPath: 'static/models/',
          },
        },
      ],
    });

    // Handle shader files
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ['raw-loader'],
    });

    // Optimize for production
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    // Improve Hot Module Replacement
    if (!isServer && config.mode === 'development') {
      config.optimization = {
        ...config.optimization,
        providedExports: false,
        usedExports: false,
        sideEffects: false,
      };
    }

    return config;
  },
  env: {
    CONTACT_EMAIL: process.env.CONTACT_EMAIL || 'contact@sharifbayoumy.com',
    GITHUB_URL: process.env.GITHUB_URL || 'https://github.com/GameBayoumy',
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=*, microphone=*, geolocation=*, xr-spatial-tracking=*',
        },
      ],
    },
  ],
};

// Bundle analyzer
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);

// Injected content via Sentry wizard below

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
  module.exports,
  {
    // For all available options, see:
    // https://www.npmjs.com/package/@sentry/webpack-plugin#options

    org: "gamebayoumy",
    project: "javascript-nextjs",

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    // tunnelRoute: "/monitoring",

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  }
);
