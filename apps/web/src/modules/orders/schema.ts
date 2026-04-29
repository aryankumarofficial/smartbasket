import type { OrderState } from "./types"

const stateOrder: Record<OrderState, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  SHIPPED: 2,
  OUT_FOR_DELIVERY: 3,
  DELIVERED: 4,
  CANCELLED: 99,
}

export function validateStateTransition(
  fromState: OrderState,
  toState: OrderState
) {
  if (fromState === "CANCELLED" || fromState === "DELIVERED") {
    throw new Error("Terminal order state cannot be changed")
  }
  if (stateOrder[toState] < stateOrder[fromState]) {
    throw new Error("Invalid backward state transition")
  }
}
