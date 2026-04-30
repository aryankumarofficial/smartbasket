import type { ReactNode } from "react"
import { Body, Container, Head, Html, Preview, Tailwind } from "react-email"

import { emailTailwindConfig } from "../theme"

export interface EmailLayoutProps {
  preview: string
  children: ReactNode
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html lang="en">
      <Tailwind config={emailTailwindConfig}>
        <Head>
          <meta name="color-scheme" content="light" />
          <meta name="supported-color-schemes" content="light" />
        </Head>
        <Body className="m-0 bg-brand-bg font-sans text-[16px] leading-[24px] text-brand-fg">
          <Preview>{preview}</Preview>
          <Container className="mx-auto max-w-[600px] px-[24px] py-[32px]">
            {children}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
