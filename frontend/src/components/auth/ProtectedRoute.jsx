import api from "@/lib/api/apiClient"
import useAuthStore from "@/lib/store/authStore"
import { useQuery } from "@tanstack/react-query"
import { Loader } from "lucide-react"
import { useEffect } from "react"
import { Navigate, useLocation } from "react-router"

const ProtectedRoute = ({ children }) => {
    const location = useLocation()

    const user = useAuthStore((s) => s.user)
    const token = useAuthStore((s) => s.token)
    const setUser = useAuthStore((s) => s.setUser ?? null) // if you added setUser
    const clearAuth = useAuthStore((s) => s.clearAuth ?? s.logout) // support either name

    // ✅ If no token, don't even query
    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    const { data, isLoading, isError, error, isSuccess } = useQuery({
        queryKey: ["currentUser"],
        queryFn: async () => {
            // ✅ Use your actual endpoint
            const res = await api.get("/auth/me")
            return res.data
        },
        enabled: !!token,          // don’t run unless token exists
        retry: 1,
        refetchOnWindowFocus: false,
    })

    // If token invalid/expired => clear auth
    useEffect(() => {
        if (isError) {
            clearAuth?.()
        }
    }, [isError, clearAuth])

    // Save user in store when we have it
    useEffect(() => {
        if (isSuccess && data) {
            // Prefer setUser to avoid overwriting token
            if (setUser) setUser(data)
            // If you don't have setUser, fallback to setAuth(user, token)
            else useAuthStore.getState().setAuth?.(data, token)
        }
    }, [isSuccess, data, token, setUser])

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader className="animate-spin" />
            </div>
        )
    }

    if (isError) {
        console.log("ProtectedRoute error:", error)
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // If user still missing, block
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return children
}

export default ProtectedRoute
