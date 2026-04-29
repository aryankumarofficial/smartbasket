import { create } from "zustand"
import { persist } from "zustand/middleware"

export type UiTheme = "light" | "dark" | "system"

export interface UiState {
  theme: UiTheme
  /** Persisted low-risk merchandising filters (not auth, not PII). */
  productFilters: {
    category?: string
    minPrice?: number
    maxPrice?: number
  }
  activeModalId: string | null
  setTheme: (theme: UiTheme) => void
  setProductFilters: (filters: UiState["productFilters"]) => void
  openModal: (id: string) => void
  closeModal: () => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: "system",
      productFilters: {},
      activeModalId: null,
      setTheme: (theme) => set({ theme }),
      setProductFilters: (productFilters) => set({ productFilters }),
      openModal: (id) => set({ activeModalId: id }),
      closeModal: () => set({ activeModalId: null }),
    }),
    {
      name: "smartbasket-ui",
      partialize: (state) => ({
        theme: state.theme,
        productFilters: state.productFilters,
      }),
    },
  ),
)
