import { NavLink, Outlet, useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import useAuthStore from "@/lib/store/authStore"
import {
    LayoutDashboard,
    ShoppingCart,
    FileText,
    Package,
    Boxes,
    CreditCard,
    Users,
    BarChart3,
    Settings,
    LogOut,
    Home,
} from "lucide-react"

const nav = [
    { to: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: "/admin/orders", label: "Orders", icon: <ShoppingCart className="w-4 h-4" /> },
    { to: "/admin/prescriptions", label: "Prescriptions", icon: <FileText className="w-4 h-4" /> },
    { to: "/admin/products", label: "Products", icon: <Package className="w-4 h-4" /> },
    { to: "/admin/inventory", label: "Inventory", icon: <Boxes className="w-4 h-4" /> },
    { to: "/admin/payments", label: "Payments", icon: <CreditCard className="w-4 h-4" /> },
    { to: "/admin/users", label: "Users", icon: <Users className="w-4 h-4" /> },
    { to: "/admin/reports", label: "Reports", icon: <BarChart3 className="w-4 h-4" /> },
    { to: "/admin/settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
]

const linkBase = "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
const linkActive = "bg-muted text-foreground"
const linkIdle = "text-muted-foreground hover:text-foreground hover:bg-muted/60"

export default function AdminLayout() {
    const navigate = useNavigate()
    const user = useAuthStore((s) => s.user)
    const logout = useAuthStore((s) => s.logout ?? s.clearAuth)

    return (
        <div className="min-h-screen bg-background">
            <div className="grid lg:grid-cols-[260px_1fr]">
                {/* Sidebar */}
                <aside className="hidden lg:block border-r bg-background/80 backdrop-blur sticky top-0 h-screen">
                    <div className="p-4">
                        <div className="font-bold text-lg">Pharmacy Admin</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            Manage orders, prescriptions & inventory
                        </div>
                    </div>

                    <div className="px-3 space-y-1">
                        {nav.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `${linkBase} ${isActive ? linkActive : linkIdle}`
                                }
                            >
                                {item.icon}
                                {item.label}
                            </NavLink>
                        ))}

                        <div className="pt-3">
                            <NavLink
                                to="/"
                                className={({ isActive }) =>
                                    `${linkBase} ${isActive ? linkActive : linkIdle}`
                                }
                            >
                                <Home className="w-4 h-4" />
                                Store Home
                            </NavLink>
                        </div>
                    </div>
                </aside>

                {/* Content */}
                <main className="min-w-0">
                    <div className="max-w-6xl mx-auto px-4 py-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}