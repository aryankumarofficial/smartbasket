import { io, type Socket } from "socket.io-client"

import { clientConfig } from "@/src/config/client"

export const SOCKET_EVENTS = {
  ORDER_UPDATE: "order:update",
  NOTIFICATION_NEW: "notification:new",
} as const

export type SocketClient = Socket

/**
 * Returns true when a Socket.IO server endpoint is explicitly configured.
 * Without one, the client would attempt to connect to the page origin
 * which — in a standard Next.js setup — is not a Socket.IO server and
 * produces "connect ENOTSOCK /" errors.
 */
export function isSocketConfigured(): boolean {
  return Boolean(clientConfig.socketUrl)
}

/**
 * Real-time channel for orders/notifications only. Do not use for catalog or recommendations.
 * Returns `null` when no socket server URL is configured.
 */
export function createAuthenticatedSocket(accessToken: string): Socket | null {
  if (!isSocketConfigured()) {
    return null
  }

  const url = clientConfig.socketUrl

  return io(url, {
    path: clientConfig.socketPath,
    auth: { token: accessToken },
    autoConnect: false,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10_000,
  })
}

export function teardownSocket(socket: Socket | null): void {
  if (!socket) {
    return
  }
  socket.removeAllListeners()
  socket.disconnect()
}
