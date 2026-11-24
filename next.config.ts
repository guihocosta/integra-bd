import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // O comprovante sobe pela Server Action; 4 MB é o limite do arquivo (a Vercel corta em 4,5 MB).
    serverActions: { bodySizeLimit: "5mb" },
  },
  turbopack: {
    // Há um package-lock.json solto em pastas acima; a raiz do projeto é esta.
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
