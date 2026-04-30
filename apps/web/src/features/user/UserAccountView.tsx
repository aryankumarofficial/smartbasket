"use client"

import { useState } from "react"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { useSocket } from "@/src/hooks/useSocket"
import { usePageEngagementTracking } from "@/src/hooks/usePageEngagementTracking"
import { useUpdateAccountMutation, useUserAccountQuery } from "@/src/hooks/queries/useUserSystemQueries"

export function UserAccountView() {
  const account = useUserAccountQuery()
  const update = useUpdateAccountMutation()
  const [note, setNote] = useState("")
  const socket = useSocket()
  usePageEngagementTracking("user_account")

  const user = account.data?.user

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl tracking-tight">Account</h1>
      <Card className="rounded-3xl border">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Email</Label>
            <Input value={user?.email ?? ""} readOnly />
          </div>
          <div className="space-y-1">
            <Label>Name</Label>
            <Input
              defaultValue={user?.name ?? ""}
              onBlur={(e) => {
                const value = e.target.value.trim()
                if (!value || value === user?.name) return
                update.mutate({ name: value })
              }}
            />
          </div>
          <div className="space-y-1">
            <Label>Preference note (local)</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <p className="text-muted-foreground text-xs">
            Live socket: {socket.connected ? "connected" : "disconnected"}
          </p>
          <Button disabled={update.isPending}>{update.isPending ? "Saving…" : "Saved via blur"}</Button>
        </CardContent>
      </Card>
    </div>
  )
}
