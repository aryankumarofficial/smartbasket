import { Heading, Section, Text } from "react-email"

import { EmailButton } from "../components/EmailButton"
import { EmailFooter } from "../components/EmailFooter"
import { EmailHeader } from "../components/EmailHeader"
import { EmailLayout } from "../components/EmailLayout"
import { appBaseUrl } from "../theme"

export interface OrderShippedEmailProps {
  customerName: string
  orderId: string
  carrier: string
  trackingNumber: string
  estimatedDelivery: string
}

export default function OrderShippedEmail({
  customerName,
  orderId,
  carrier,
  trackingNumber,
  estimatedDelivery,
}: OrderShippedEmailProps) {
  const trackUrl = `${appBaseUrl()}/orders/${orderId}?track=1`

  return (
    <EmailLayout preview={`Your SmartBasket order has shipped`}>
      <Section className="rounded-[12px] border border-solid border-brand-border bg-brand-surface px-[24px] py-[28px]">
        <EmailHeader />
        <Heading as="h1" className="m-0 text-[24px] font-bold leading-[32px] text-brand-fg">
          Your order is on the way
        </Heading>
        <Text className="mt-[12px] text-[16px] leading-[24px] text-brand-fg">
          Hi {customerName}, great news — your package has left our fulfillment center.
        </Text>
        <Section className="mt-[20px] rounded-[10px] bg-brand-accent px-[16px] py-[16px]">
          <Text className="m-0 text-[13px] font-semibold uppercase tracking-wide text-brand-muted">
            Shipping status
          </Text>
          <Text className="m-0 mt-[6px] text-[16px] font-semibold text-brand-fg">Shipped</Text>
          <Text className="m-0 mt-[16px] text-[13px] font-semibold uppercase tracking-wide text-brand-muted">
            Order
          </Text>
          <Text className="m-0 mt-[4px] font-mono text-[14px] text-brand-fg">{orderId}</Text>
          <Text className="m-0 mt-[16px] text-[13px] font-semibold uppercase tracking-wide text-brand-muted">
            Carrier (mock)
          </Text>
          <Text className="m-0 mt-[4px] text-[15px] text-brand-fg">{carrier}</Text>
          <Text className="m-0 mt-[16px] text-[13px] font-semibold uppercase tracking-wide text-brand-muted">
            Tracking number
          </Text>
          <Text className="m-0 mt-[4px] font-mono text-[14px] text-brand-fg">{trackingNumber}</Text>
          <Text className="m-0 mt-[16px] text-[13px] font-semibold uppercase tracking-wide text-brand-muted">
            Estimated delivery
          </Text>
          <Text className="m-0 mt-[4px] text-[15px] text-brand-fg">{estimatedDelivery}</Text>
        </Section>
        <Section className="mt-[28px] text-center">
          <EmailButton href={trackUrl}>Track order</EmailButton>
        </Section>
      </Section>
      <EmailFooter />
    </EmailLayout>
  )
}

OrderShippedEmail.PreviewProps = {
  customerName: "Ravi",
  orderId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  carrier: "SmartBasket Express",
  trackingNumber: "SB-IN-MOCK-8839214",
  estimatedDelivery: "Fri, May 2 — Sun, May 4",
} satisfies OrderShippedEmailProps
