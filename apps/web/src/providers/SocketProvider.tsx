"use client"

import { useQueryClient } from "@tanstack/react-query"
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { Socket } from "socket.io-client"

import { SOCKET_EVENTS, createAuthenticatedSocket, teardownSocket } from "@/src/lib/socket"
import { useAuthStore } from "@/src/stores/auth.store"

export type SocketContextValue = {
  socket: Socket | null
  connected: boolean
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  connected: false,
})

export function SocketProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const accessToken = useAuthStore((s) => s.accessToken)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!accessToken) {
      setSocket((prev) => {
        if (prev) {
          teardownSocket(prev)
        }
        return null
      })
      setConnected(false)
      return
    }

    const next = createAuthenticatedSocket(accessToken)

    const onConnect = () => setConnected(true)
    const onDisconnect = () => setConnected(false)

    const onOrderUpdate = () => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] })
    }

    const onNotification = () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] })
      void queryClient.invalidateQueries({ queryKey: ["orders"] })
    }

    next.on("connect", onConnect)
    next.on("disconnect", onDisconnect)
    next.on(SOCKET_EVENTS.ORDER_UPDATE, onOrderUpdate)
    next.on(SOCKET_EVENTS.NOTIFICATION_NEW, onNotification)

    setSocket(next)
    next.connect()

    return () => {
      next.off("connect", onConnect)
      next.off("disconnect", onDisconnect)
      next.off(SOCKET_EVENTS.ORDER_UPDATE, onOrderUpdate)
      next.off(SOCKET_EVENTS.NOTIFICATION_NEW, onNotification)
      teardownSocket(next)
      setConnected(false)
      setSocket(null)
    }
  }, [accessToken, queryClient])

  const value = useMemo(
    (): SocketContextValue => ({
      socket,
      connected,
    }),
    [socket, connected],
  )

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export function useSocketContext(): SocketContextValue {
  return useContext(SocketContext)
}
