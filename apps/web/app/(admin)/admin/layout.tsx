import type { ReactNode } from "react"

import { AdminRoleGate } from "@/src/components/features/admin/admin-role-gate"
import { AdminShell } from "@/src/components/layout/admin-shell"

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminRoleGate>
      <AdminShell>{children}</AdminShell>
    </AdminRoleGate>
  )
}
