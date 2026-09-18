import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/video", destination: "/video-studio", permanent: false },
      { source: "/image", destination: "/image-studio", permanent: false },
      { source: "/photoshoot", destination: "/product-photoshoot", permanent: false },
      { source: "/marketing", destination: "/product-photoshoot", permanent: false },
      { source: "/assets", destination: "/history", permanent: false },
    ];
  },
};

export default nextConfig;
