/** @type {import('next').NextConfig} */
const isGithubPages = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export',
  basePath: isGithubPages ? '/sc-webstudio' : '',
  assetPrefix: isGithubPages ? '/sc-webstudio/' : '',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  output: 'export',
};

export default nextConfig;
