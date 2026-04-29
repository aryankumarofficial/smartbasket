import { validateStateTransition } from "./schema"
import type { OrderState } from "./types"

export const ordersService = {
  validateTransition(fromState: OrderState, toState: OrderState) {
    validateStateTransition(fromState, toState)
  },
}
