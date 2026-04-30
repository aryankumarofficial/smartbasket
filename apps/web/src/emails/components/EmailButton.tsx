import type { ReactNode } from "react"
import { Button } from "react-email"

export interface EmailButtonProps {
  href: string
  children: ReactNode
}

export function EmailButton({ href, children }: EmailButtonProps) {
  return (
    <Button
      href={href}
      className="box-border rounded-[10px] bg-brand-primary px-[24px] py-[14px] text-center text-[16px] font-semibold text-brand-onPrimary no-underline"
    >
      {children}
    </Button>
  )
}
