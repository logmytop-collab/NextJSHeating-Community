// @ts-check

const API_SERVER = process.env.API_SERVER
  ? process.env.API_SERVER
  : "server_api";

const nextConfig = {
  allowedDevOrigins: ["127.0.0.1"],

  experimental: {
    typedEnv: true,
    globalNotFound: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
  output: "standalone",
  typedRoutes: true,
  async redirects() {
    return [
      {
        source: "/",
        has: [
          {
            type: "host",
            value: "127.0.0.1",
          },
        ],
        destination: "/intro",
        permanent: false, // or true if SEO requires it
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*", // Frontend API route
        destination: "http://" + API_SERVER + ":5000/:path*", // Backend API
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/_next/webpack-hmr", // Target the HMR WebSocket endpoint
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "http://frontend:3000", // Replace with your client origin (e.g., "https://your-app.com")
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, OPTIONS", // WebSocket starts with GET
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "Upgrade, Connection, Sec-WebSocket-Key, Sec-WebSocket-Version", // Required WebSocket headers
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,POST,PUT,DELETE,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
//const withImages = require('next-images');
