"use client"

import type { Socket } from "socket.io-client"

import { useSocketContext } from "@/src/providers/SocketProvider"

export type UseSocketResult = {
  socket: Socket | null
  connected: boolean
  isReady: boolean
}

/**
 * Safe access to the realtime socket; null until authenticated + connected pipeline finishes.
 */
export function useSocket(): UseSocketResult {
  const { socket, connected } = useSocketContext()

  return {
    socket,
    connected,
    isReady: Boolean(socket && connected),
  }
}
