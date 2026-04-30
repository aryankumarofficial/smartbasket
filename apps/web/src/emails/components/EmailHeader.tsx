import { Column, Link, Row, Section, Text } from "react-email"

import { appBaseUrl } from "../theme"

export function EmailHeader() {
  const home = appBaseUrl()

  return (
    <Section className="mb-[28px]">
      <Link href={home} className="no-underline text-inherit">
        <Row>
          <Column className="w-[56px] align-top">
            <Text
              className="m-0 inline-block h-[44px] w-[44px] rounded-[10px] bg-brand-primary text-center text-[20px] font-bold leading-[44px] text-brand-onPrimary"
              style={{ fontFamily: "Space Grotesk, Inter, sans-serif" }}
            >
              SB
            </Text>
          </Column>
          <Column className="align-top pl-[12px]">
            <Text className="m-0 font-display text-[22px] font-bold leading-[26px] text-brand-fg">
              SmartBasket
            </Text>
            <Text className="m-0 mt-[4px] text-[13px] leading-[18px] text-brand-muted">
              AI-powered shopping
            </Text>
          </Column>
        </Row>
      </Link>
    </Section>
  )
}
