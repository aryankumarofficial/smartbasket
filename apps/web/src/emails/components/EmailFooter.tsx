import { Hr, Link, Section, Text } from "react-email"

import { appBaseUrl } from "../theme"

export interface EmailFooterProps {
  /** When false, hides unsubscribe line (transactional default). */
  showUnsubscribe?: boolean
}

export function EmailFooter({ showUnsubscribe = false }: EmailFooterProps) {
  const base = appBaseUrl()

  return (
    <Section className="mt-[32px]">
      <Hr className="m-0 border-0 border-t border-solid border-brand-border" />
      <Text className="mt-[20px] text-[13px] leading-[20px] text-brand-muted">
        © {new Date().getFullYear()} SmartBasket. All rights reserved.
      </Text>
      <Text className="m-0 text-[13px] leading-[20px] text-brand-muted">
        Questions?{" "}
        <Link href={`${base}/account`} className="text-brand-primary no-underline">
          Visit your account
        </Link>
      </Text>
      {showUnsubscribe ? (
        <Text className="mt-[12px] text-[12px] leading-[18px] text-brand-muted">
          <Link href={`${base}/account/notifications`} className="text-brand-muted underline">
            Notification preferences
          </Link>
        </Text>
      ) : null}
    </Section>
  )
}
