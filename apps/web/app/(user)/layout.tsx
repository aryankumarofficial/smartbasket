import type { Metadata } from "next"

import { UserRoleGate } from "@/src/components/features/user/user-role-gate"
import { UserShell } from "@/src/components/layout/user-shell"

export const metadata: Metadata = {
  title: {
    default: "SmartBasket User",
    template: "%s · SmartBasket",
  },
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserRoleGate>
      <UserShell>{children}</UserShell>
    </UserRoleGate>
  )
}
