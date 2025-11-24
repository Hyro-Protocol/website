import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    deviceSizes: [
      1920,
      1536,
      1280,
      1024,
      768,
      640,
    ],
    qualities: [10, 50, 75, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "app.local.tookey.cloud",
      },
      {
        protocol: "https",
        hostname: "hyr0.xyz",
      },
    ],
  },
}

// Make sure you wrap your `nextConfig`
// with the `withPayload` plugin
export default withPayload(nextConfig) 