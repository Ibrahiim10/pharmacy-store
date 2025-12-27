import useAuthStore from "@/lib/store/authStore"
import { Navigate, useLocation } from "react-router"


const RoleRoute = ({ roles, children, redirectTo = "/" }) => {
    const user = useAuthStore((s) => s.user)
    const location = useLocation()

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (!roles.includes(user.role)) {
        return <Navigate to={redirectTo} replace />
    }

    return children
}

export default RoleRoute
