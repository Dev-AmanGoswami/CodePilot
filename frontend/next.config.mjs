/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This app lives in a subfolder of a larger repo; pin tracing to it so Next
  // doesn't pick up the parent lockfile as the workspace root.
  outputFileTracingRoot: import.meta.dirname,
  // Proxy /api/* to your future backend so the browser stays same-origin (no CORS).
  // Set BACKEND_URL in .env.local when your BE is ready, then flip NEXT_PUBLIC_API_MODE=http.
  async rewrites() {
    const backend = process.env.BACKEND_URL;
    if (!backend) return [];
    return [{ source: "/api/:path*", destination: `${backend}/api/:path*` }];
  },
};

export default nextConfig;
