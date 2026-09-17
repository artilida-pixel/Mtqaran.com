import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // sharp ships a native binary per platform — bundling it would break the
  // route handler that resizes uploaded village photos, so it must stay an
  // external require resolved at runtime instead.
  serverExternalPackages: ["sharp"],

  async headers() {
    return [
      {
        // The map's roads/regions/water layers (public/geo/*.geojson) are
        // fetched client-side instead of being embedded in every /fund page
        // load — cache them hard so repeat visits (and other viewers) don't
        // re-download ~1.3MB of geometry that essentially never changes. A
        // real content change means renaming the file, not just replacing it.
        source: "/geo/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
