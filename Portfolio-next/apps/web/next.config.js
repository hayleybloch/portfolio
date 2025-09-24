/** @type {import('next').NextConfig} */
const isPages = process.env.GITHUB_PAGES === 'true';
const repo = 'portfolio';

const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  basePath: isPages ? `/${repo}` : '',
  assetPrefix: isPages ? `/${repo}/` : '',
  transpilePackages: ['rpc'],
  webpack: (config) => {
    config.module.rules.push({
      test: /\.frag$/,
      type: 'asset/source',
    });

    config.module.rules.push({
      test: /\.vert$/,
      type: 'asset/source',
    });

    return config;
  },
};

module.exports = nextConfig;
