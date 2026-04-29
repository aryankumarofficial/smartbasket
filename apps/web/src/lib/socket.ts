import { io, type Socket } from "socket.io-client"

import { clientConfig } from "@/src/config/client"

export const SOCKET_EVENTS = {
  ORDER_UPDATE: "order:update",
  NOTIFICATION_NEW: "notification:new",
} as const

export type SocketClient = Socket

/**
 * Real-time channel for orders/notifications only. Do not use for catalog or recommendations.
 */
export function createAuthenticatedSocket(accessToken: string): Socket {
  const url = clientConfig.socketUrl || undefined

  return io(url, {
    path: clientConfig.socketPath,
    auth: { token: accessToken },
    autoConnect: false,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Number.POSITIVE_INFINITY,
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
