import { create } from "zustand"
import { persist } from "zustand/middleware"

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      // After login/register
      setAuth: (userData, token) =>
        set({
          user: userData,
          token,
          isAuthenticated: true,
        }),

      // Update user only (e.g. after /auth/me)
      setUser: (userData) =>
        set({
          user: userData,
          isAuthenticated: !!get().token,
        }),

      // Logout
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),

      // Token getter (for non-react usage)
      getToken: () => get().token,
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore
