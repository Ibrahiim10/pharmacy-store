import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AlertTriangle, CalendarClock, Search, Ban, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import { fetchProducts, updateProduct } from "@/lib/api/admin.api"

const tabs = [
    { key: "low", label: "Low Stock" },
    { key: "expiring", label: "Expiring Soon" },
    { key: "expired", label: "Expired" },
    { key: "all", label: "All Inventory" },
]

function Pill({ children }) {
    return (
        <span className="text-xs px-2 py-1 rounded-full border bg-muted/40 inline-flex items-center">
            {children}
        </span>
    )
}

function daysLeft(expiryDate) {
    if (!expiryDate) return null
    const exp = new Date(expiryDate).getTime()
    if (Number.isNaN(exp)) return null
    const diff = exp - Date.now()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function isExpired(expiryDate) {
    const d = daysLeft(expiryDate)
    return d !== null && d < 0
}

function isExpiringSoon(expiryDate, days = 30) {
    const d = daysLeft(expiryDate)
    return d !== null && d >= 0 && d <= days
}

export default function AdminInventoryPage() {
    const qc = useQueryClient()

    const [q, setQ] = useState("")
    const [tab, setTab] = useState("low")
    const [error, setError] = useState(null)

    // quick restock state per product
    const [restock, setRestock] = useState({}) // { [productId]: number }

    const { data, isLoading, isError } = useQuery({
        queryKey: ["adminProductsInventory"],
        queryFn: () => fetchProducts({}),
        refetchOnWindowFocus: false,
    })

    const products = useMemo(() => {
        const raw = data
        return Array.isArray(raw) ? raw : raw?.items || []
    }, [data])

    const updateMutation = useMutation({
        mutationFn: updateProduct,
        onSuccess: () => {
            setError(null)
            qc.invalidateQueries({ queryKey: ["adminProductsInventory"] })
            qc.invalidateQueries({ queryKey: ["adminProducts"] })
        },
        onError: (err) => setError(err?.response?.data?.message || "Update failed"),
    })

    const stats = useMemo(() => {
        const total = products.length
        const low = products.filter((p) => Number(p.countInStock) <= 5).length
        const expiring = products.filter((p) => isExpiringSoon(p.expiryDate, 30)).length
        const expired = products.filter((p) => isExpired(p.expiryDate)).length
        const inactive = products.filter((p) => p.status === "inactive").length
        return { total, low, expiring, expired, inactive }
    }, [products])

    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase()
        let list = products

        if (tab === "low") list = list.filter((p) => Number(p.countInStock) <= 5)
        if (tab === "expiring") list = list.filter((p) => isExpiringSoon(p.expiryDate, 30))
        if (tab === "expired") list = list.filter((p) => isExpired(p.expiryDate))

        if (!term) return list

        return list.filter((p) => {
            const name = String(p.name || "").toLowerCase()
            const category = String(p.category || "").toLowerCase()
            return name.includes(term) || category.includes(term)
        })
    }, [products, q, tab])

    const setRestockValue = (productId, value) => {
        const n = Number(value)
        setRestock((prev) => ({ ...prev, [productId]: Number.isNaN(n) ? 0 : n }))
    }

    const doRestock = (p) => {
        setError(null)
        const add = Number(restock[p._id] || 0)
        if (!add || add <= 0) {
            setError("Enter a restock quantity greater than 0.")
            return
        }

        const payload = {
            countInStock: Number(p.countInStock || 0) + add,
        }

        updateMutation.mutate({ id: p._id, payload })
    }

    const deactivate = (p) => {
        setError(null)
        updateMutation.mutate({ id: p._id, payload: { status: "inactive" } })
    }

    const activate = (p) => {
        setError(null)
        updateMutation.mutate({ id: p._id, payload: { status: "active" } })
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Inventory</h1>
                    <p className="text-sm text-muted-foreground">
                        Track stock levels and expiry dates for pharmacy products.
                    </p>
                </div>

                {/* Search */}
                <div className="w-full md:w-[420px] flex items-center gap-2 rounded-xl border bg-background p-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search by product name or category..."
                        className="border-0 shadow-none focus-visible:ring-0"
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <Card className="border-border">
                    <CardContent className="p-4">
                        <div className="text-xs text-muted-foreground">Total Products</div>
                        <div className="text-2xl font-bold mt-1">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card className="border-border">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <div className="text-xs text-muted-foreground">Low Stock (≤ 5)</div>
                            <div className="text-2xl font-bold mt-1">{stats.low}</div>
                        </div>
                        <AlertTriangle className="w-5 h-5 text-muted-foreground" />
                    </CardContent>
                </Card>

                <Card className="border-border">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <div className="text-xs text-muted-foreground">Expiring (≤ 30 days)</div>
                            <div className="text-2xl font-bold mt-1">{stats.expiring}</div>
                        </div>
                        <CalendarClock className="w-5 h-5 text-muted-foreground" />
                    </CardContent>
                </Card>

                <Card className="border-border">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <div className="text-xs text-muted-foreground">Expired</div>
                            <div className="text-2xl font-bold mt-1">{stats.expired}</div>
                        </div>
                        <Ban className="w-5 h-5 text-muted-foreground" />
                    </CardContent>
                </Card>

                <Card className="border-border">
                    <CardContent className="p-4">
                        <div className="text-xs text-muted-foreground">Inactive</div>
                        <div className="text-2xl font-bold mt-1">{stats.inactive}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
                {tabs.map((t) => (
                    <Button
                        key={t.key}
                        variant={tab === t.key ? "default" : "outline"}
                        onClick={() => setTab(t.key)}
                    >
                        {t.label}
                    </Button>
                ))}
            </div>

            {/* Error */}
            {error && (
                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                    {error}
                </div>
            )}

            {/* List */}
            <div>
                {isLoading && <p>Loading inventory...</p>}
                {isError && <p className="text-destructive">Failed to load products.</p>}

                {!isLoading && !isError && filtered.length === 0 && (
                    <p className="text-muted-foreground">No products found in this filter.</p>
                )}

                <div className="grid gap-3 mt-4">
                    {filtered.map((p) => {
                        const dLeft = daysLeft(p.expiryDate)
                        const expired = isExpired(p.expiryDate)
                        const expSoon = isExpiringSoon(p.expiryDate, 30)
                        const low = Number(p.countInStock) <= 5

                        return (
                            <Card key={p._id} className="border-border">
                                <CardContent className="p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                    {/* Left */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 border rounded overflow-hidden bg-muted flex items-center justify-center">
                                            {p.image ? (
                                                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xs text-muted-foreground">No image</span>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <div className="font-semibold flex items-center gap-2 flex-wrap">
                                                <span>{p.name}</span>
                                                <Pill>{p.status}</Pill>
                                                {low && <Pill>Low stock</Pill>}
                                                {expSoon && !expired && <Pill>Expiring soon</Pill>}
                                                {expired && <Pill>Expired</Pill>}
                                            </div>

                                            <div className="text-sm text-muted-foreground">
                                                {p.category} • Stock: <b>{p.countInStock}</b> • Price: KES{" "}
                                                <b>{p.price}</b>
                                            </div>

                                            <div className="text-xs text-muted-foreground">
                                                Expiry: {String(p.expiryDate).slice(0, 10) || "-"}
                                                {dLeft !== null && (
                                                    <>
                                                        {" "}
                                                        •{" "}
                                                        <span className={expired ? "text-destructive" : ""}>
                                                            {expired ? `${Math.abs(dLeft)} day(s) expired` : `${dLeft} day(s) left`}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right actions */}
                                    <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                                        {/* Restock */}
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                min="0"
                                                placeholder="Qty"
                                                value={restock[p._id] ?? ""}
                                                onChange={(e) => setRestockValue(p._id, e.target.value)}
                                                className="w-24"
                                            />
                                            <Button
                                                variant="outline"
                                                className="gap-2"
                                                onClick={() => doRestock(p)}
                                                disabled={updateMutation.isPending}
                                            >
                                                <Plus className="w-4 h-4" />
                                                Restock
                                            </Button>
                                        </div>

                                        {/* Activate / Deactivate */}
                                        {p.status === "active" ? (
                                            <Button
                                                variant="destructive"
                                                onClick={() => deactivate(p)}
                                                disabled={updateMutation.isPending}
                                            >
                                                Deactivate
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={() => activate(p)}
                                                disabled={updateMutation.isPending}
                                            >
                                                Activate
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
