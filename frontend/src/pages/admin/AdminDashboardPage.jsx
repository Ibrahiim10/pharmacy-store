import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import {
    AlertTriangle,
    BadgeCheck,
    CalendarClock,
    Clock,
    FileText,
    Package,
    ShoppingCart,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { fetchAllOrders, fetchProducts } from "@/lib/api/admin.api"

// Charts
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    BarChart,
    Bar,
} from "recharts"

function moneyKES(n) {
    const num = Number(n || 0)
    return new Intl.NumberFormat("en-KE").format(num)
}

function toDayKey(date) {
    const d = new Date(date)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
}

function daysLeft(expiryDate) {
    if (!expiryDate) return null
    const exp = new Date(expiryDate).getTime()
    if (Number.isNaN(exp)) return null
    return Math.ceil((exp - Date.now()) / (1000 * 60 * 60 * 24))
}

function isExpiringSoon(expiryDate, days = 30) {
    const d = daysLeft(expiryDate)
    return d !== null && d >= 0 && d <= days
}

function Pill({ children }) {
    return (
        <span className="text-xs px-2 py-1 rounded-full border bg-muted/40 inline-flex items-center">
            {children}
        </span>
    )
}

function StatCard({ title, value, hint, icon }) {
    return (
        <Card className="border-border">
            <CardContent className="p-4 flex items-center justify-between">
                <div>
                    <div className="text-xs text-muted-foreground">{title}</div>
                    <div className="text-2xl font-bold mt-1">{value}</div>
                    {hint ? <div className="text-xs text-muted-foreground mt-1">{hint}</div> : null}
                </div>
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    {icon}
                </div>
            </CardContent>
        </Card>
    )
}

export default function AdminDashboardPage() {
    const navigate = useNavigate()
    const [rangeDays, setRangeDays] = useState(7)

    const ordersQ = useQuery({
        queryKey: ["adminOrders"],
        queryFn: fetchAllOrders,
        refetchOnWindowFocus: false,
    })

    const productsQ = useQuery({
        queryKey: ["adminProductsForDashboard"],
        queryFn: () => fetchProducts({}),
        refetchOnWindowFocus: false,
    })

    const orders = ordersQ.data || []
    const productsRaw = productsQ.data
    const products = Array.isArray(productsRaw) ? productsRaw : productsRaw?.items || []

    const filteredOrders = useMemo(() => {
        const now = Date.now()
        const from = now - rangeDays * 24 * 60 * 60 * 1000
        return orders.filter((o) => new Date(o.createdAt).getTime() >= from)
    }, [orders, rangeDays])

    const stats = useMemo(() => {
        const total = orders.length
        const pending = orders.filter((o) => o.status === "pending").length
        const approved = orders.filter((o) => o.status === "approved").length
        const dispatched = orders.filter((o) => o.status === "dispatched").length
        const delivered = orders.filter((o) => o.status === "delivered").length
        const rejected = orders.filter((o) => o.status === "rejected").length

        const revenue = orders.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0)

        const rxTotal = orders.filter((o) => o.requiresPrescription).length
        const rxWaitingUpload = orders.filter((o) => o.requiresPrescription && !o.prescription?.url).length
        const rxPendingReview = orders.filter((o) => o.requiresPrescription && !!o.prescription?.url && o.status === "pending").length

        const lowStock = products.filter((p) => Number(p.countInStock) <= 5).length
        const expiring = products.filter((p) => isExpiringSoon(p.expiryDate, 30)).length

        return {
            total,
            pending,
            approved,
            dispatched,
            delivered,
            rejected,
            revenue,
            rxTotal,
            rxWaitingUpload,
            rxPendingReview,
            lowStock,
            expiring,
        }
    }, [orders, products])

    const statusChart = useMemo(() => {
        return [
            { status: "pending", count: stats.pending },
            { status: "approved", count: stats.approved },
            { status: "dispatched", count: stats.dispatched },
            { status: "delivered", count: stats.delivered },
            { status: "rejected", count: stats.rejected },
        ]
    }, [stats])

    const revenueByDay = useMemo(() => {
        const bucket = {}
        for (const o of filteredOrders) {
            const k = toDayKey(o.createdAt)
            bucket[k] = (bucket[k] || 0) + Number(o.totalPrice || 0)
        }
        return Object.entries(bucket)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([day, amount]) => ({ day: day.slice(5), amount }))
    }, [filteredOrders])

    const recentOrders = useMemo(() => {
        return [...orders]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 6)
    }, [orders])

    const rxQueue = useMemo(() => {
        return [...orders]
            .filter((o) => o.requiresPrescription)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 6)
    }, [orders])

    const lowStockList = useMemo(() => {
        return [...products]
            .filter((p) => Number(p.countInStock) <= 5)
            .sort((a, b) => Number(a.countInStock) - Number(b.countInStock))
            .slice(0, 6)
    }, [products])

    const expSoonList = useMemo(() => {
        return [...products]
            .filter((p) => isExpiringSoon(p.expiryDate, 30))
            .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
            .slice(0, 6)
    }, [products])

    const loading = ordersQ.isLoading || productsQ.isLoading
    const error = ordersQ.isError || productsQ.isError

    return (
        <div className="space-y-6">
            {/* Header + actions */}
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                        Monitor orders, prescriptions, payments and inventory.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => navigate("/admin/orders")} className="gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        Orders
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/admin/prescriptions")} className="gap-2">
                        <FileText className="w-4 h-4" />
                        Prescriptions
                    </Button>
                    <Button onClick={() => navigate("/admin/products")} className="gap-2">
                        <Package className="w-4 h-4" />
                        Products
                    </Button>
                </div>
            </div>

            {loading && <p>Loading dashboard...</p>}
            {error && <p className="text-destructive">Failed to load dashboard data.</p>}

            {!loading && !error && (
                <>
                    {/* KPI cards */}
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Total Orders"
                            value={stats.total}
                            hint={`Pending: ${stats.pending}`}
                            icon={<FileText className="w-5 h-5" />}
                        />
                        <StatCard
                            title="Revenue (KES)"
                            value={moneyKES(stats.revenue)}
                            hint={`Delivered: ${stats.delivered}`}
                            icon={<BadgeCheck className="w-5 h-5" />}
                        />
                        <StatCard
                            title="Prescriptions"
                            value={stats.rxTotal}
                            hint={`Upload: ${stats.rxWaitingUpload} • Review: ${stats.rxPendingReview}`}
                            icon={<FileText className="w-5 h-5" />}
                        />
                        <StatCard
                            title="Inventory Alerts"
                            value={stats.lowStock + stats.expiring}
                            hint={`Low: ${stats.lowStock} • Expiring: ${stats.expiring}`}
                            icon={<AlertTriangle className="w-5 h-5" />}
                        />
                    </div>

                    {/* Charts */}
                    <div className="grid gap-4 lg:grid-cols-2">
                        <Card>
                            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                                <CardTitle className="text-base">Revenue Trend</CardTitle>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant={rangeDays === 7 ? "default" : "outline"}
                                        onClick={() => setRangeDays(7)}
                                    >
                                        7d
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={rangeDays === 30 ? "default" : "outline"}
                                        onClick={() => setRangeDays(30)}
                                    >
                                        30d
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="h-[320px]">
                                {revenueByDay.length === 0 ? (
                                    <div className="text-sm text-muted-foreground">No revenue data.</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={revenueByDay}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="day" />
                                            <YAxis />
                                            <Tooltip formatter={(v) => [`KES ${moneyKES(v)}`, "Revenue"]} />
                                            <Line type="monotone" dataKey="amount" strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Orders by Status</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[320px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={statusChart}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="status" />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Bar dataKey="count" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Widgets */}
                    <div className="grid gap-4 lg:grid-cols-3">
                        {/* Recent orders */}
                        <Card className="lg:col-span-2">
                            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                                <CardTitle className="text-base">Recent Orders</CardTitle>
                                <Button variant="outline" size="sm" onClick={() => navigate("/admin/orders")}>
                                    View all
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {recentOrders.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No orders yet.</p>
                                ) : (
                                    recentOrders.map((o) => (
                                        <div
                                            key={o._id}
                                            className="flex items-center justify-between rounded-lg border p-3"
                                        >
                                            <div className="space-y-1">
                                                <div className="font-medium">
                                                    #{String(o._id).slice(-6)}{" "}
                                                    <span className="text-muted-foreground">• {o.user?.name || "Customer"}</span>
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {new Date(o.createdAt).toLocaleString()} • {o.orderItems?.length || 0} item(s)
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {o.requiresPrescription && <Pill>Rx</Pill>}
                                                <Pill>{o.status}</Pill>
                                                <div className="text-sm font-semibold">KES {moneyKES(o.totalPrice)}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>

                        {/* Prescription queue */}
                        <Card>
                            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                                <CardTitle className="text-base">Prescription Queue</CardTitle>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate("/admin/prescriptions")}
                                >
                                    Open
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {rxQueue.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No Rx orders.</p>
                                ) : (
                                    rxQueue.map((o) => {
                                        const uploaded = !!o.prescription?.url
                                        return (
                                            <div key={o._id} className="rounded-lg border p-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="font-medium">#{String(o._id).slice(-6)}</div>
                                                    <Pill>{uploaded ? "Uploaded" : "Waiting"}</Pill>
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {o.user?.name || "Customer"} • {o.status}
                                                </div>
                                                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(o.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Inventory alerts */}
                    <div className="grid gap-4 lg:grid-cols-2">
                        <Card>
                            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                                <CardTitle className="text-base">Low Stock</CardTitle>
                                <Button variant="outline" size="sm" onClick={() => navigate("/admin/inventory")}>
                                    Manage
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {lowStockList.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No low stock items.</p>
                                ) : (
                                    lowStockList.map((p) => (
                                        <div key={p._id} className="flex items-center justify-between rounded-lg border p-3">
                                            <div className="min-w-0">
                                                <div className="font-medium line-clamp-1">{p.name}</div>
                                                <div className="text-xs text-muted-foreground">{p.category}</div>
                                            </div>
                                            <Pill>Stock: {p.countInStock}</Pill>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                                <CardTitle className="text-base">Expiring Soon (≤ 30 days)</CardTitle>
                                <Button variant="outline" size="sm" onClick={() => navigate("/admin/inventory")}>
                                    Manage
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {expSoonList.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No expiring items.</p>
                                ) : (
                                    expSoonList.map((p) => (
                                        <div key={p._id} className="flex items-center justify-between rounded-lg border p-3">
                                            <div className="min-w-0">
                                                <div className="font-medium line-clamp-1">{p.name}</div>
                                                <div className="text-xs text-muted-foreground">{p.category}</div>
                                            </div>
                                            <Pill>
                                                <CalendarClock className="w-3 h-3 mr-1" />
                                                {String(p.expiryDate).slice(0, 10)}
                                            </Pill>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    )
}
