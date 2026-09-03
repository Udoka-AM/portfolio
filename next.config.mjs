/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Cloudflare Pages serves this as plain static files. Every route is
  // prerendered and there is no server-side behaviour, so an export costs
  // nothing and makes the site portable to any static host.
  output: "export",

  // Emit each route as <route>/index.html rather than <route>.html. GitHub
  // Pages serves static files literally, so without this the canonical URLs
  // and internal links — which all carry a trailing slash — 404.
  trailingSlash: true,
};

export default nextConfig;
