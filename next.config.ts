import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // sharp ships a native binary per platform — bundling it would break the
  // route handler that resizes uploaded village photos, so it must stay an
  // external require resolved at runtime instead.
  serverExternalPackages: ["sharp"],
};

export default nextConfig;
