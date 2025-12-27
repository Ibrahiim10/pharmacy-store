import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Download, CalendarDays } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchAllOrders } from "@/lib/api/admin.api"

// ✅ Charts
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
    PieChart,
    Pie,
    Cell,
    Legend,
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

function downloadCSV(filename, rows) {
    const escape = (v) => {
        const s = String(v ?? "")
        if (s.includes(",") || s.includes("\n") || s.includes('"')) return `"${s.replace(/"/g, '""')}"`
        return s
    }
    const header = Object.keys(rows[0] || {}).join(",")
    const body = rows.map((r) => Object.values(r).map(escape).join(",")).join("\n")
    const csv = [header, body].filter(Boolean).join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
}

function Stat({ title, value, hint }) {
    return (
        <Card className="border-border">
            <CardContent className="p-4">
                <div className="text-xs text-muted-foreground">{title}</div>
                <div className="text-2xl font-bold mt-1">{value}</div>
                {hint ? <div className="text-xs text-muted-foreground mt-1">{hint}</div> : null}
            </CardContent>
        </Card>
    )
}

// Pie colors: we won't set explicit colors (your system preference). Recharts needs colors,
// so we’ll just reuse a small set; if you want, I can hook it to CSS variables later.
const PIE_COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#00C49F", "#0088FE"]

export default function AdminReportsPage() {
    const [rangeDays, setRangeDays] = useState(7)

    const { data: orders = [], isLoading, isError } = useQuery({
        queryKey: ["adminOrders"],
        queryFn: fetchAllOrders,
        refetchOnWindowFocus: false,
    })

    const filteredByRange = useMemo(() => {
        const now = Date.now()
        const from = now - rangeDays * 24 * 60 * 60 * 1000
        return (orders || []).filter((o) => {
            const t = new Date(o.createdAt).getTime()
            return !Number.isNaN(t) && t >= from
        })
    }, [orders, rangeDays])

    const summary = useMemo(() => {
        const list = filteredByRange
        const totalOrders = list.length
        const paidOrders = list.filter((o) => o.isPaid).length

        const pending = list.filter((o) => o.status === "pending").length
        const approved = list.filter((o) => o.status === "approved").length
        const dispatched = list.filter((o) => o.status === "dispatched").length
        const delivered = list.filter((o) => o.status === "delivered").length
        const rejected = list.filter((o) => o.status === "rejected").length

        const rxOrders = list.filter((o) => o.requiresPrescription).length
        const revenue = list.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0)

        const paymentSplit = list.reduce((acc, o) => {
            const m = (o.paymentMethod || "unknown").toLowerCase()
            acc[m] = (acc[m] || 0) + 1
            return acc
        }, {})

        return {
            totalOrders,
            paidOrders,
            pending,
            approved,
            dispatched,
            delivered,
            rejected,
            rxOrders,
            revenue,
            paymentSplit,
        }
    }, [filteredByRange])

    // ✅ Orders by status chart data
    const statusChart = useMemo(() => {
        return [
            { status: "pending", count: summary.pending },
            { status: "approved", count: summary.approved },
            { status: "dispatched", count: summary.dispatched },
            { status: "delivered", count: summary.delivered },
            { status: "rejected", count: summary.rejected },
        ]
    }, [summary])

    // ✅ Payment methods pie data
    const paymentPie = useMemo(() => {
        const entries = Object.entries(summary.paymentSplit || {})
        return entries.map(([name, value]) => ({ name, value }))
    }, [summary])

    // ✅ Top products chart
    const topProducts = useMemo(() => {
        const map = new Map()
        for (const o of filteredByRange) {
            for (const it of o.orderItems || []) {
                const key = it.product || it.name
                const prev = map.get(key) || { name: it.name || "Unknown", qty: 0, revenue: 0 }
                const qty = Number(it.qty || 0)
                const price = Number(it.price || 0)
                prev.qty += qty
                prev.revenue += qty * price
                prev.name = it.name || prev.name
                map.set(key, prev)
            }
        }
        return Array.from(map.values())
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 8)
            .map((p) => ({ name: p.name, qty: p.qty }))
    }, [filteredByRange])

    // ✅ Revenue by day line chart data
    const revenueByDay = useMemo(() => {
        const bucket = {}
        for (const o of filteredByRange) {
            const k = toDayKey(o.createdAt)
            bucket[k] = (bucket[k] || 0) + Number(o.totalPrice || 0)
        }

        return Object.entries(bucket)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([day, amount]) => ({
                day: day.slice(5), // show MM-DD
                amount,
            }))
    }, [filteredByRange])

    const exportOrdersCSV = () => {
        const rows = (filteredByRange || []).map((o) => ({
            orderId: o._id,
            createdAt: o.createdAt,
            customerName: o.user?.name || "",
            customerEmail: o.user?.email || "",
            status: o.status,
            paymentMethod: o.paymentMethod || "",
            isPaid: o.isPaid ? "yes" : "no",
            totalPrice: o.totalPrice,
            requiresPrescription: o.requiresPrescription ? "yes" : "no",
            city: o.shippingAddress?.city || "",
            county: o.shippingAddress?.county || "",
        }))
        if (!rows.length) return
        downloadCSV(`pharmacy_orders_last_${rangeDays}_days.csv`, rows)
    }

    const exportSummaryCSV = () => {
        downloadCSV(`pharmacy_summary_last_${rangeDays}_days.csv`, [
            {
                rangeDays,
                totalOrders: summary.totalOrders,
                paidOrders: summary.paidOrders,
                revenueKES: summary.revenue,
                rxOrders: summary.rxOrders,
                pending: summary.pending,
                approved: summary.approved,
                dispatched: summary.dispatched,
                delivered: summary.delivered,
                rejected: summary.rejected,
            },
        ])
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Reports</h1>
                    <p className="text-sm text-muted-foreground">
                        Sales, orders, prescriptions and top-selling products.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={rangeDays === 7 ? "default" : "outline"}
                        onClick={() => setRangeDays(7)}
                        className="gap-2"
                    >
                        <CalendarDays className="w-4 h-4" />
                        Last 7 days
                    </Button>

                    <Button
                        variant={rangeDays === 30 ? "default" : "outline"}
                        onClick={() => setRangeDays(30)}
                        className="gap-2"
                    >
                        <CalendarDays className="w-4 h-4" />
                        Last 30 days
                    </Button>

                    <Button variant="outline" onClick={exportSummaryCSV} className="gap-2">
                        <Download className="w-4 h-4" />
                        Export Summary
                    </Button>

                    <Button onClick={exportOrdersCSV} className="gap-2">
                        <Download className="w-4 h-4" />
                        Export Orders
                    </Button>
                </div>
            </div>

            {isLoading && <p>Loading reports...</p>}
            {isError && <p className="text-destructive">Failed to load report data.</p>}

            {!isLoading && !isError && (
                <>
                    {/* KPIs */}
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <Stat title="Revenue (KES)" value={moneyKES(summary.revenue)} hint={`Paid orders: ${summary.paidOrders}`} />
                        <Stat title="Total Orders" value={summary.totalOrders} hint={`Rx orders: ${summary.rxOrders}`} />
                        <Stat title="Delivered" value={summary.delivered} hint={`Dispatched: ${summary.dispatched}`} />
                        <Stat title="Pending" value={summary.pending} hint={`Rejected: ${summary.rejected}`} />
                    </div>

                    {/* Charts row 1 */}
                    <div className="grid gap-4 lg:grid-cols-2">
                        {/* Revenue line chart */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Revenue Trend</CardTitle>
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

                        {/* Orders by status bar chart */}
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

                    {/* Charts row 2 */}
                    <div className="grid gap-4 lg:grid-cols-2">
                        {/* Payment pie */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Payment Methods</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[320px]">
                                {paymentPie.length === 0 ? (
                                    <div className="text-sm text-muted-foreground">No payment data.</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Tooltip />
                                            <Legend />
                                            <Pie
                                                data={paymentPie}
                                                dataKey="value"
                                                nameKey="name"
                                                outerRadius={100}
                                                label
                                            >
                                                {paymentPie.map((_, i) => (
                                                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </CardContent>
                        </Card>

                        {/* Top products bar */}
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Top Products Sold (Qty)</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[320px]">
                                {topProducts.length === 0 ? (
                                    <div className="text-sm text-muted-foreground">No product sales data.</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={topProducts}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" hide />
                                            <YAxis allowDecimals={false} />
                                            <Tooltip />
                                            <Bar dataKey="qty" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                                <div className="mt-3 text-xs text-muted-foreground">
                                    Tip: Hover bars to see product names and quantities.
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    )
}
