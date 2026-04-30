import { SignJWT, jwtVerify } from "jose"

function getPasswordResetSecret() {
  const s =
    process.env.JWT_PASSWORD_RESET_SECRET ??
    (process.env.NODE_ENV !== "production"
      ? "dev-password-reset-secret-change-me"
      : undefined)
  if (!s) {
    throw new Error("JWT_PASSWORD_RESET_SECRET is not configured")
  }
  return new TextEncoder().encode(s)
}

export async function signPasswordResetToken(userId: string): Promise<string> {
  return new SignJWT({ purpose: "password_reset" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(getPasswordResetSecret())
}

export async function verifyPasswordResetToken(
  token: string
): Promise<{ sub: string }> {
  const { payload } = await jwtVerify(token, getPasswordResetSecret())
  if (payload.purpose !== "password_reset") {
    throw new Error("Invalid token purpose")
  }
  const sub = String(payload.sub ?? "")
  if (!sub) throw new Error("Invalid token")
  return { sub }
}
