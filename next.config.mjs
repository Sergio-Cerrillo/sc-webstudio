/** @type {import('next').NextConfig} */

const nextConfig = {
  trailingSlash: false,
  images: {
    unoptimized: false,
    // Proposal images are served directly behind middleware, never through the
    // public optimizer cache. Keep the existing portfolio assets optimizable.
    localPatterns: [
      { pathname: '/logo/**' },
      { pathname: '/*.png' },
      { pathname: '/*.jpg' },
      { pathname: '/*.webp' },
      { pathname: '/*.svg' },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    // Optional local escape hatch for machines with very little free disk.
    if (process.env.SC_BUILD_MEMORY_CACHE === '1') config.cache = false;
    if (!isServer) {
      config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    }
    return config;
  },
}

export default nextConfig;
