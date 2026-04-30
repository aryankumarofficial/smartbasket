export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-gradient-to-b from-muted/40 to-transparent px-4 py-12">
      {children}
    </div>
  )
}
