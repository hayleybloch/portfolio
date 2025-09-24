/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['rpc'],
  devIndicators: false,
  outputFileTracingRoot: '../..',
  output: process.env.GITHUB_PAGES ? 'export' : undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // Add fallbacks for Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      url: false,
      zlib: false,
      http: false,
      https: false,
      assert: false,
      os: false,
      path: false,
    };

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
  async headers() {
    if (process.env.GITHUB_PAGES) {
      return {};
    }
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
    if (process.env.GITHUB_PAGES) {
      return {};
    }
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