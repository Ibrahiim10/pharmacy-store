import { Button } from "@/components/ui/button"
import useAuthStore from "@/lib/store/authStore"
import useCartStore from "@/lib/store/cartStore"
import { Link, NavLink, useNavigate } from "react-router"
import { ShoppingCart, User } from "lucide-react"

export default function Navbar() {
    const navigate = useNavigate()
    const count = useCartStore((s) => s.cartCount())
    const user = useAuthStore((s) => s.user)
    const logout = useAuthStore((s) => s.logout ?? s.clearAuth)

    const isStaff = user?.role === "admin" || user?.role === "pharmacist"

    const navClass = ({ isActive }) =>
        `text-sm font-medium transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
        }`

    return (
        <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 font-bold text-lg">
                    <div className="w-8 h-8 rounded-md bg-emerald-500/15 flex items-center justify-center">
                        <span className="text-emerald-600 font-bold">+</span>
                    </div>
                    <span>Pharmacy Store</span>
                </Link>

                {/* Center nav */}
                <nav className="hidden md:flex items-center gap-6">
                    <NavLink to="/" className={navClass}>
                        Home
                    </NavLink>

                    {/* Shop just scrolls to products for now */}
                    <button
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => {
                            // If you're on home, scroll to products section
                            if (window.location.pathname === "/") {
                                document.getElementById("shop-section")?.scrollIntoView({
                                    behavior: "smooth",
                                })
                            } else {
                                navigate("/", { state: { scrollToShop: true } })
                            }
                        }}
                    >
                        Shop
                    </button>

                    <NavLink to="/about" className={navClass}>
                        About Us
                    </NavLink>
                    <NavLink to="/contact" className={navClass}>
                        Contact
                    </NavLink>

                    {user && (
                        <NavLink to="/orders" className={navClass}>
                            My Orders
                        </NavLink>
                    )}

                    {isStaff && (
                        <>
                            <NavLink to="/admin" className={navClass}>
                                Admin
                            </NavLink>
                        </>
                    )}
                </nav>

                {/* Right actions */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => navigate("/cart")}
                    >
                        <ShoppingCart className="w-4 h-4" />
                        <span className="hidden sm:inline">Cart</span>
                        <span className="ml-1 text-xs px-2 py-0.5 rounded-full border">
                            {count}
                        </span>
                    </Button>

                    {user ? (
                        <>
                            <Button
                                variant="outline"
                                className="gap-2 hidden sm:flex"
                                onClick={() => navigate("/orders")}
                            >
                                <User className="w-4 h-4" />
                                {user?.name?.split(" ")?.[0] || "Account"}
                            </Button>

                            <Button
                                variant="destructive"
                                onClick={() => {
                                    logout?.()
                                    navigate("/")
                                }}
                            >
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => navigate("/login")}>
                                Login
                            </Button>
                            <Button onClick={() => navigate("/register")}>Register</Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
