import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card"

export default function AdminUsersPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-muted-foreground mt-1 text-sm">Directory & roles (coming soon).</p>
      </div>
      <Card className="rounded-2xl border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Placeholder</CardTitle>
          <CardDescription>
            Hook this view to your CRM or support tooling when user administration requirements land.
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  )
}
