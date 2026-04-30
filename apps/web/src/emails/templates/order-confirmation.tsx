import { Heading, Row, Column, Section, Text } from "react-email"

import { EmailButton } from "../components/EmailButton"
import { EmailFooter } from "../components/EmailFooter"
import { EmailHeader } from "../components/EmailHeader"
import { EmailLayout } from "../components/EmailLayout"
import { appBaseUrl } from "../theme"

export interface OrderLineItem {
  productName: string
  quantity: number
  priceAtPurchase: string
}

export interface OrderConfirmationEmailProps {
  customerName: string
  orderId: string
  total: string
  currency: string
  items: OrderLineItem[]
}

function formatMoney(amount: string, currency: string) {
  const n = Number(amount)
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 2,
    }).format(n)
  } catch {
    return `${currency} ${amount}`
  }
}

export default function OrderConfirmationEmail({
  customerName,
  orderId,
  total,
  currency,
  items,
}: OrderConfirmationEmailProps) {
  const viewUrl = `${appBaseUrl()}/orders/${orderId}`

  return (
    <EmailLayout preview={`Order confirmed — ${orderId.slice(0, 8)}…`}>
      <Section className="rounded-[12px] border border-solid border-brand-border bg-brand-surface px-[24px] py-[28px]">
        <EmailHeader />
        <Heading as="h1" className="m-0 text-[24px] font-bold leading-[32px] text-brand-fg">
          Thanks for your order
        </Heading>
        <Text className="mt-[12px] text-[16px] leading-[24px] text-brand-fg">
          Hi {customerName}, we have received your payment and are preparing your items.
        </Text>
        <Text className="mt-[8px] text-[14px] leading-[22px] text-brand-muted">
          Order ID:{" "}
          <span className="font-mono text-[13px] text-brand-fg">{orderId}</span>
        </Text>

        <Section className="mt-[24px]">
          <Text className="m-0 text-[14px] font-semibold uppercase tracking-wide text-brand-muted">
            Items
          </Text>
          {items.map((line, idx) => {
            const lineTotal = String(Number(line.priceAtPurchase) * line.quantity)
            return (
              <Row key={`${idx}-${line.productName}`} className="mt-[12px]">
                <Column className="w-[55%] align-top">
                  <Text className="m-0 text-[15px] font-medium leading-[22px] text-brand-fg">
                    {line.productName}
                  </Text>
                </Column>
                <Column className="w-[15%] align-top text-right">
                  <Text className="m-0 text-[14px] text-brand-muted">×{line.quantity}</Text>
                </Column>
                <Column className="w-[30%] align-top text-right">
                  <Text className="m-0 text-[14px] font-medium text-brand-fg">
                    {formatMoney(lineTotal, currency)}
                  </Text>
                </Column>
              </Row>
            )
          })}
        </Section>

        <Section className="mt-[20px] border-0 border-t border-solid border-brand-border pt-[20px]">
          <Row>
            <Column>
              <Text className="m-0 text-[16px] font-semibold text-brand-fg">Total</Text>
            </Column>
            <Column className="text-right">
              <Text className="m-0 text-[18px] font-bold text-brand-primary">
                {formatMoney(total, currency)}
              </Text>
            </Column>
          </Row>
        </Section>

        <Section className="mt-[28px] text-center">
          <EmailButton href={viewUrl}>View order</EmailButton>
        </Section>
      </Section>
      <EmailFooter />
    </EmailLayout>
  )
}

OrderConfirmationEmail.PreviewProps = {
  customerName: "Asha",
  orderId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  total: "2499.00",
  currency: "INR",
  items: [
    { productName: "Organic basmati rice (5 kg)", quantity: 1, priceAtPurchase: "899.00" },
    { productName: "Cold-pressed groundnut oil", quantity: 2, priceAtPurchase: "800.00" },
  ],
} satisfies OrderConfirmationEmailProps
