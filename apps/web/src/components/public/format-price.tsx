export function formatInr(price: string | number | undefined | null): string {
  if (price === undefined || price === null || price === "") {
    return "—"
  }
  const n = typeof price === "string" ? Number(price) : price
  if (Number.isNaN(n)) {
    return String(price)
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n)
}
