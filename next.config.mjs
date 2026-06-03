/** @type {import('next').NextConfig} */

const nextConfig = {
  trailingSlash: false,
  images: {
    unoptimized: false,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    }
    return config;
  },
}

export default nextConfig;
