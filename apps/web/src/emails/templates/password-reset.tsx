import { Heading, Section, Text } from "react-email"

import { EmailButton } from "../components/EmailButton"
import { EmailFooter } from "../components/EmailFooter"
import { EmailHeader } from "../components/EmailHeader"
import { EmailLayout } from "../components/EmailLayout"

export interface PasswordResetEmailProps {
  customerName: string
  resetUrl: string
  expiresInLabel: string
}

export default function PasswordResetEmail({
  customerName,
  resetUrl,
  expiresInLabel,
}: PasswordResetEmailProps) {
  return (
    <EmailLayout preview="Reset your SmartBasket password">
      <Section className="rounded-[12px] border border-solid border-brand-border bg-brand-surface px-[24px] py-[28px]">
        <EmailHeader />
        <Heading as="h1" className="m-0 text-[24px] font-bold leading-[32px] text-brand-fg">
          Password reset
        </Heading>
        <Text className="mt-[12px] text-[16px] leading-[24px] text-brand-fg">
          Hi {customerName}, we received a request to reset the password for your SmartBasket account.
        </Text>
        <Text className="mt-[12px] text-[15px] leading-[22px] text-brand-muted">
          This link expires in <strong className="text-brand-fg">{expiresInLabel}</strong>. If you did
          not request a reset, you can ignore this message — your password will stay the same.
        </Text>
        <Section className="mt-[28px] text-center">
          <EmailButton href={resetUrl}>Reset password</EmailButton>
        </Section>
      </Section>
      <EmailFooter />
    </EmailLayout>
  )
}

PasswordResetEmail.PreviewProps = {
  customerName: "Jordan",
  resetUrl: "https://smartbasket.app/reset-password?token=preview",
  expiresInLabel: "1 hour",
} satisfies PasswordResetEmailProps
