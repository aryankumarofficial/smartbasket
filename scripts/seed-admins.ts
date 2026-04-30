import { hash } from "bcryptjs"
import { and, eq, inArray } from "drizzle-orm"

import { db } from "@workspace/db/client"
import { createEmailLog } from "@workspace/db/queries/email-log"
import { users } from "@workspace/db/schema"
import { queues } from "../apps/web/lib/workers/queues"

export interface SeedAdminResult {
  id: string
  email: string
  role: "admin" | "super_admin"
  temporaryPassword: string
}

const ADMIN_LOGIN_URL =
  process.env.ADMIN_LOGIN_URL ?? "http://localhost:3000/login?role=admin"

const ADMIN_SPECS = [
  {
    email: "superadmin@smartbasket.dev",
    name: "SmartBasket Root",
    role: "super_admin" as const,
    temporaryPassword: "SuperAdmin@123",
  },
  {
    email: "ops.admin@smartbasket.dev",
    name: "Ops Admin",
    role: "admin" as const,
    temporaryPassword: "AdminOps@123",
  },
  {
    email: "catalog.admin@smartbasket.dev",
    name: "Catalog Admin",
    role: "admin" as const,
    temporaryPassword: "AdminCatalog@123",
  },
]

export async function seedAdmins(): Promise<SeedAdminResult[]> {
  const emails = ADMIN_SPECS.map((spec) => spec.email)
  const existing = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(inArray(users.email, emails))

  const existingByEmail = new Map(existing.map((row) => [row.email, row]))
  const created: SeedAdminResult[] = []

  for (const spec of ADMIN_SPECS) {
    const already = existingByEmail.get(spec.email)
    let userId = already?.id
    let role = (already?.role ?? spec.role) as "admin" | "super_admin"

    if (!already) {
      const passwordHash = await hash(spec.temporaryPassword, 12)
      const [inserted] = await db
        .insert(users)
        .values({
          email: spec.email,
          name: spec.name,
          role: spec.role,
          passwordHash,
        })
        .returning({
          id: users.id,
          email: users.email,
          role: users.role,
        })

      if (!inserted) {
        throw new Error(`Failed to create admin ${spec.email}`)
      }
      userId = inserted.id
      role = inserted.role as "admin" | "super_admin"
    } else if (already.role !== spec.role) {
      const [updated] = await db
        .update(users)
        .set({ role: spec.role, updatedAt: new Date() })
        .where(and(eq(users.id, already.id), eq(users.email, spec.email)))
        .returning({ id: users.id, role: users.role })
      if (updated) {
        userId = updated.id
        role = updated.role as "admin" | "super_admin"
      }
    }

    if (!userId) continue

    const emailLog = await createEmailLog({
      userId,
      recipientEmail: spec.email,
      emailType: "ADMIN_ONBOARDING",
      status: "pending",
    })

    await queues.emailDelivery.add(
      "deliver",
      {
        type: "ADMIN_ONBOARDING",
        emailLogId: emailLog.id,
        userId,
        temporaryPassword: spec.temporaryPassword,
        loginUrl: ADMIN_LOGIN_URL,
      },
      {
        attempts: 3,
        removeOnComplete: 200,
        removeOnFail: 200,
        backoff: { type: "exponential", delay: 2000 },
      }
    )

    created.push({
      id: userId,
      email: spec.email,
      role,
      temporaryPassword: spec.temporaryPassword,
    })
  }

  return created
}
