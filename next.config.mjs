/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Cloudflare Pages serves this as plain static files. Every route is
  // prerendered and there is no server-side behaviour, so an export costs
  // nothing and makes the site portable to any static host.
  output: "export",
};

export default nextConfig;
