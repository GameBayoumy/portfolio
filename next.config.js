/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true,
  },
  images: {
    domains: ['sharifbayoumy.nl', 'github.com', 'linkedin.com'],
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

    return config;
  },
  env: {
    CONTACT_EMAIL: 'contact@sharifbayoumy.com',
    GITHUB_URL: 'https://github.com/GameBayoumy',
    LINKEDIN_URL: 'https://www.linkedin.com/in/sharif-bayoumy/',
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