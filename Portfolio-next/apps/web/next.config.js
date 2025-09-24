const { config } = require('process')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['rpc'],
  devIndicators: false,
  // Generate a fully static export we can open via index.html
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  // Use relative paths for assets to work over file://
  assetPrefix: './',
  webpack: (config) => {
    config.module.rules.push({
      test: /\.frag$/,
      // This is the asset module.
      type: 'asset/source',
    });

    config.module.rules.push({
      test: /\.vert$/,
      // This is the asset module.
      type: 'asset/source',
    });

    return config;
  },
  async headers() {
    return [
      {
        source: "/",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ]
  },
  async redirects() {
    return [
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
    ]
  }
}

module.exports = nextConfig
