import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CRITICAL FIX: Renaming the experimental setting to the current standard (Next.js 16.x)
  // This explicitly tells the server to bundle @prisma/client and dotenv, resolving the "Cannot find module" error.
  serverExternalPackages: ["@prisma/client", "dotenv"],
};

export default nextConfig;