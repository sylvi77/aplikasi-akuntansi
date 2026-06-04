import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gzip all HTTP responses — big win for low-bandwidth / low-spec devices
  compress: true,

  // Remove the X-Powered-By: Next.js header (tiny security + bandwidth win)
  poweredByHeader: false,

  experimental: {
    // Tree-shake large icon / chart packages so only used exports are bundled
    optimizePackageImports: ["lucide-react", "recharts"],
  },
};

export default nextConfig;
