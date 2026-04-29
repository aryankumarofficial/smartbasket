"use client"

import type { ReactNode } from "react"

import { AuthBootstrap } from "@/src/providers/AuthBootstrap"
import { QueryProvider } from "@/src/providers/QueryProvider"
import { SocketProvider } from "@/src/providers/SocketProvider"

/**
 * Client boundary for server state + realtime. Wrap inside ThemeProvider when using UiThemeBridge.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthBootstrap />
      <SocketProvider>{children}</SocketProvider>
    </QueryProvider>
  )
}
