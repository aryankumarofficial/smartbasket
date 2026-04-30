import * as argon2 from "argon2"

/**
 * Argon2id per OWASP recommendations for password storage.
 * Runs on the Node.js runtime (Route Handlers), not Edge middleware.
 */
const HASH_OPTIONS: argon2.Options & { type: typeof argon2.argon2id } = {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
}

export async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, HASH_OPTIONS)
}

export async function verifyPassword(plain: string, storedHash: string): Promise<boolean> {
  try {
    return await argon2.verify(storedHash, plain)
  } catch {
    return false
  }
}
