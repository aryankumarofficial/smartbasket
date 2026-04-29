import { customType } from "drizzle-orm/pg-core"

export const vector = (name: string, dimensions: number) =>
  customType<{ data: number[]; driverData: string }>({
    dataType() {
      return `vector(${dimensions})`
    },
    toDriver(value) {
      return `[${value.join(",")}]`
    },
    fromDriver(value) {
      if (typeof value === "string") {
        const trimmed = value.trim()
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
          const inner = trimmed.slice(1, -1)
          if (!inner) return []
          return inner.split(",").map((item) => Number(item.trim()))
        }
      }
      return []
    },
  })(name)
