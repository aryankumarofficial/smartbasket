const FIRST_NAMES = [
  "Aarav",
  "Vihaan",
  "Ishaan",
  "Aditya",
  "Arjun",
  "Kabir",
  "Reyansh",
  "Anaya",
  "Aanya",
  "Diya",
  "Ira",
  "Myra",
  "Sara",
  "Kiara",
  "Riya",
]

const LAST_NAMES = [
  "Sharma",
  "Patel",
  "Gupta",
  "Mehta",
  "Reddy",
  "Iyer",
  "Kapoor",
  "Nair",
  "Bansal",
  "Malhotra",
]

const PRODUCT_ADJECTIVES = [
  "Premium",
  "Elegant",
  "Handcrafted",
  "Smart",
  "Classic",
  "Deluxe",
  "Artisan",
  "Minimal",
  "Modern",
  "Personalized",
]

const PRODUCT_NOUNS = [
  "Gift Box",
  "Watch",
  "Wallet",
  "Perfume",
  "Desk Lamp",
  "Coffee Kit",
  "Photo Frame",
  "Planner",
  "Bluetooth Speaker",
  "Travel Organizer",
]

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomFloat(min: number, max: number, precision = 2): number {
  const value = Math.random() * (max - min) + min
  const power = 10 ** precision
  return Math.round(value * power) / power
}

export function pickOne<T>(items: readonly T[]): T {
  return items[randomInt(0, items.length - 1)] as T
}

export function pickManyUnique<T>(items: readonly T[], count: number): T[] {
  const copy = [...items]
  const out: T[] = []
  while (copy.length > 0 && out.length < count) {
    const idx = randomInt(0, copy.length - 1)
    const [value] = copy.splice(idx, 1)
    if (value !== undefined) out.push(value)
  }
  return out
}

export function randomDateWithinDays(daysBack: number): Date {
  const now = Date.now()
  const offsetMs = randomInt(0, daysBack * 24 * 60 * 60 * 1000)
  return new Date(now - offsetMs)
}

export function buildName(): string {
  return `${pickOne(FIRST_NAMES)} ${pickOne(LAST_NAMES)}`
}

export function buildEmail(name: string, index: number, domain = "smartbasket.dev") {
  const normalized = name.toLowerCase().replace(/\s+/g, ".")
  return `${normalized}.${index}@${domain}`
}

export function buildProductName(index: number): string {
  return `${pickOne(PRODUCT_ADJECTIVES)} ${pickOne(PRODUCT_NOUNS)} ${index}`
}
