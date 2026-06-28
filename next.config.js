const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: async function headers() {
    return [
      {
        source: "/",
        headers: [
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "unsafe-none",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true, // Skip TypeScript checks during the build
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        port: "",
      },
      {
        protocol: "https",
        hostname: "fileserver.badgi.net",
        port: "",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
        port: ""
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000", // Include the port number if you're running on a specific port
        pathname: "/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
      allowedOrigins: [
        "http://localhost:3000",
        "http://127.0.0.1:5500",
        "*",
        "https://maps.googleapis.com",
        // "https://73twcr2k-3000.euw.devtunnels.ms",
      ],
    },
  },
};

module.exports = withNextIntl(nextConfig);
