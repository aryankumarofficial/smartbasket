import { cn } from "@workspace/ui/lib/utils"

export function SmartBasketMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn(className)}
      aria-hidden
      role="img"
    >
      <defs>
        <linearGradient id="sb-basket" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.62 0.17 145)" />
          <stop offset="100%" stopColor="oklch(0.55 0.14 250)" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="36" height="36" rx="12" className="fill-[url(#sb-basket)] opacity-90" />
      <path
        d="M12 16h16l-1.2 12.2a2 2 0 0 1-2 1.8H15.2a2 2 0 0 1-2-1.8L12 16Z"
        className="fill-background/90"
      />
      <path
        d="M15 14c0-4 10-4 10 0"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        className="stroke-background/85"
      />
    </svg>
  )
}
