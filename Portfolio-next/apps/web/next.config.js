/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['rpc'],
  devIndicators: false,
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
  // Only add headers and redirects when not exporting
  ...(process.env.GITHUB_PAGES ? {} : {
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
  })
}

module.exports = nextConfig
