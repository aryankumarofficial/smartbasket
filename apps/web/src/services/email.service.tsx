import { render } from "react-email"

import OrderConfirmationEmail from "@/src/emails/templates/order-confirmation"
import OrderShippedEmail from "@/src/emails/templates/order-shipped"
import PasswordResetEmail from "@/src/emails/templates/password-reset"
import type { OrderLineItem } from "@/src/emails/templates/order-confirmation"
import { Resend } from "resend"

let resend: Resend | null = null

function getResendClient(): Resend {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    throw new Error("RESEND_API_KEY is not set")
  }
  resend ??= new Resend(key)
  return resend
}

function getFromAddress(): string {
  const from = process.env.RESEND_FROM_EMAIL
  if (from) return from
  if (process.env.NODE_ENV !== "production") {
    return "SmartBasket <onboarding@resend.dev>"
  }
  throw new Error("RESEND_FROM_EMAIL is not set")
}

export const emailService = {
  async sendOrderConfirmation(input: {
    to: string
    customerName: string
    orderId: string
    total: string
    currency: string
    items: OrderLineItem[]
  }) {
    const html = await render(
      <OrderConfirmationEmail
        customerName={input.customerName}
        orderId={input.orderId}
        total={input.total}
        currency={input.currency}
        items={input.items}
      />
    )
    const text = await render(
      <OrderConfirmationEmail
        customerName={input.customerName}
        orderId={input.orderId}
        total={input.total}
        currency={input.currency}
        items={input.items}
      />,
      { plainText: true }
    )

    const { data, error } = await getResendClient().emails.send({
      from: getFromAddress(),
      to: input.to,
      subject: `Order confirmed — SmartBasket #${input.orderId.slice(0, 8)}`,
      html,
      text,
    })

    if (error) {
      throw new Error(error.message ?? "Resend rejected the message")
    }
    return data
  },

  async sendOrderShipped(input: {
    to: string
    customerName: string
    orderId: string
    carrier: string
    trackingNumber: string
    estimatedDelivery: string
  }) {
    const html = await render(
      <OrderShippedEmail
        customerName={input.customerName}
        orderId={input.orderId}
        carrier={input.carrier}
        trackingNumber={input.trackingNumber}
        estimatedDelivery={input.estimatedDelivery}
      />
    )
    const text = await render(
      <OrderShippedEmail
        customerName={input.customerName}
        orderId={input.orderId}
        carrier={input.carrier}
        trackingNumber={input.trackingNumber}
        estimatedDelivery={input.estimatedDelivery}
      />,
      { plainText: true }
    )

    const { data, error } = await getResendClient().emails.send({
      from: getFromAddress(),
      to: input.to,
      subject: "Your SmartBasket order has shipped",
      html,
      text,
    })

    if (error) {
      throw new Error(error.message ?? "Resend rejected the message")
    }
    return data
  },

  async sendPasswordReset(input: {
    to: string
    customerName: string
    resetUrl: string
    expiresInLabel: string
  }) {
    const html = await render(
      <PasswordResetEmail
        customerName={input.customerName}
        resetUrl={input.resetUrl}
        expiresInLabel={input.expiresInLabel}
      />
    )
    const text = await render(
      <PasswordResetEmail
        customerName={input.customerName}
        resetUrl={input.resetUrl}
        expiresInLabel={input.expiresInLabel}
      />,
      { plainText: true }
    )

    const { data, error } = await getResendClient().emails.send({
      from: getFromAddress(),
      to: input.to,
      subject: "Reset your SmartBasket password",
      html,
      text,
    })

    if (error) {
      throw new Error(error.message ?? "Resend rejected the message")
    }
    return data
  },

  async sendAdminOnboarding(input: {
    to: string
    adminName: string
    role: "admin" | "super_admin"
    temporaryPassword: string
    loginUrl: string
  }) {
    const roleLabel =
      input.role === "super_admin" ? "Super Admin" : "Admin"
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111">
        <h2>Welcome to SmartBasket Admin</h2>
        <p>Hi ${input.adminName},</p>
        <p>Your ${roleLabel} account is ready.</p>
        <p><strong>Login URL:</strong> <a href="${input.loginUrl}">${input.loginUrl}</a></p>
        <p><strong>Email:</strong> ${input.to}</p>
        <p><strong>Temporary Password:</strong> ${input.temporaryPassword}</p>
        <p>Please sign in and rotate your password immediately.</p>
      </div>
    `
    const text = [
      "Welcome to SmartBasket Admin",
      `Hi ${input.adminName},`,
      `Your ${roleLabel} account is ready.`,
      `Login URL: ${input.loginUrl}`,
      `Email: ${input.to}`,
      `Temporary Password: ${input.temporaryPassword}`,
      "Please sign in and rotate your password immediately.",
    ].join("\n")

    const { data, error } = await getResendClient().emails.send({
      from: getFromAddress(),
      to: input.to,
      subject: "Your SmartBasket admin account is ready",
      html,
      text,
    })

    if (error) {
      throw new Error(error.message ?? "Resend rejected the message")
    }
    return data
  },
}
