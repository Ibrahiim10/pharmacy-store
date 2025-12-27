import { create } from "zustand"
import { persist } from "zustand/middleware"

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // { productId, name, price, qty, countInStock }

      addItem: (product) => {
        const items = get().items
        const existing = items.find((i) => i.productId === product.productId)

        if (existing) {
          // increase qty but don’t exceed stock
          const updated = items.map((i) =>
            i.productId === product.productId
              ? { ...i, qty: Math.min(i.qty + 1, i.countInStock) }
              : i
          )
          return set({ items: updated })
        }

        set({ items: [...items, { ...product, qty: 1 }] })
      },

      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.productId !== productId) }),

      updateQty: (productId, qty) => {
        const updated = get().items.map((i) =>
          i.productId === productId
            ? { ...i, qty: Math.max(1, Math.min(qty, i.countInStock)) }
            : i
        )
        set({ items: updated })
      },

      clearCart: () => set({ items: [] }),

      cartCount: () => get().items.reduce((sum, i) => sum + i.qty, 0),
      cartTotal: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
    }),
    { name: "cart-storage" }
  )
)

export default useCartStore
