/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui", "@workspace/db"],
  /** Native Argon2 bindings must load from node_modules at runtime. */
  serverExternalPackages: ["argon2"],
}

export default nextConfig
