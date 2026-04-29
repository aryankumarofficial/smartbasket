/**
 * Public client configuration only. Never put secrets here.
 */
export const clientConfig = {
  /** Empty string = same-origin (recommended for Next.js BFF). */
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "",
  /** Empty string = same-origin Socket.IO server. */
  socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL?.replace(/\/$/, "") ?? "",
  socketPath: process.env.NEXT_PUBLIC_SOCKET_PATH ?? "/socket.io",
} as const
