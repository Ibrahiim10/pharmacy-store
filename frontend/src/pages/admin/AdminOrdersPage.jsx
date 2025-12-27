import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
    BadgeCheck,
    CheckCircle2,
    Clock,
    FileText,
    PackageCheck,
    Search,
    Truck,
    XCircle,
    Eye,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

// shadcn dialog
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"

import { fetchAllOrders, decideOrder, updateOrderStatus } from "@/lib/api/admin.api"

const statusTabs = ["All", "pending", "approved", "dispatched", "delivered", "rejected"]

function StatusBadge({ status }) {
    const base = "text-xs px-2 py-1 rounded-full border inline-flex items-center gap-1"

    if (status === "pending")
        return (
            <span className={`${base} bg-yellow-500/10`}>
                <Clock className="w-3 h-3" /> pending
            </span>
        )

    if (status === "approved")
        return (
            <span className={`${base} bg-emerald-500/10`}>
                <BadgeCheck className="w-3 h-3" /> approved
            </span>
        )

    if (status === "rejected")
        return (
            <span className={`${base} bg-red-500/10`}>
                <XCircle className="w-3 h-3" /> rejected
            </span>
        )

    if (status === "dispatched")
        return (
            <span className={`${base} bg-blue-500/10`}>
                <Truck className="w-3 h-3" /> dispatched
            </span>
        )

    if (status === "delivered")
        return (
            <span className={`${base} bg-purple-500/10`}>
                <PackageCheck className="w-3 h-3" /> delivered
            </span>
        )

    return <span className={base}>{status}</span>
}

function moneyKES(n) {
    const num = Number(n || 0)
    return new Intl.NumberFormat("en-KE").format(num)
}

function StatCard({ title, value, icon }) {
    return (
        <Card className="border-border">
            <CardContent className="p-4 flex items-center justify-between">
                <div>
                    <div className="text-xs text-muted-foreground">{title}</div>
                    <div className="text-2xl font-bold mt-1">{value}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    {icon}
                </div>
            </CardContent>
        </Card>
    )
}

export default function AdminOrdersPage() {
    const qc = useQueryClient()

    const [q, setQ] = useState("")
    const [activeStatus, setActiveStatus] = useState("All")
    const [notes, setNotes] = useState({}) // { [orderId]: string }
    const [error, setError] = useState(null)

    // modal
    const [open, setOpen] = useState(false)
    const [selected, setSelected] = useState(null)

    // pagination
    const [page, setPage] = useState(1)
    const pageSize = 6

    const { data: orders = [], isLoading, isError } = useQuery({
        queryKey: ["adminOrders"],
        queryFn: fetchAllOrders,
        refetchOnWindowFocus: false,
    })

    const decideMutation = useMutation({
        mutationFn: decideOrder,
        onSuccess: () => {
            setError(null)
            qc.invalidateQueries({ queryKey: ["adminOrders"] })
        },
        onError: (err) => setError(err?.response?.data?.message || "Decision failed"),
    })

    const statusMutation = useMutation({
        mutationFn: updateOrderStatus,
        onSuccess: () => {
            setError(null)
            qc.invalidateQueries({ queryKey: ["adminOrders"] })
        },
        onError: (err) => setError(err?.response?.data?.message || "Status update failed"),
    })

    const stats = useMemo(() => {
        const total = orders.length
        const pending = orders.filter((o) => o.status === "pending").length
        const approved = orders.filter((o) => o.status === "approved").length
        const dispatched = orders.filter((o) => o.status === "dispatched").length
        const delivered = orders.filter((o) => o.status === "delivered").length
        const rejected = orders.filter((o) => o.status === "rejected").length
        const rxNeeded = orders.filter((o) => o.requiresPrescription).length
        const revenue = orders.reduce((sum, o) => sum + Number(o.totalPrice || 0), 0)

        return { total, pending, approved, dispatched, delivered, rejected, rxNeeded, revenue }
    }, [orders])

    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase()
        let list = orders

        if (activeStatus !== "All") {
            list = list.filter((o) => (o.status || "").toLowerCase() === activeStatus)
        }

        if (!term) return list

        return list.filter((o) => {
            const id = String(o._id || "").toLowerCase()
            const name = String(o.user?.name || "").toLowerCase()
            const email = String(o.user?.email || "").toLowerCase()
            const status = String(o.status || "").toLowerCase()
            const city = String(o.shippingAddress?.city || "").toLowerCase()
            const county = String(o.shippingAddress?.county || "").toLowerCase()
            const payment = String(o.paymentMethod || "").toLowerCase()

            return (
                id.includes(term) ||
                name.includes(term) ||
                email.includes(term) ||
                status.includes(term) ||
                city.includes(term) ||
                county.includes(term) ||
                payment.includes(term)
            )
        })
    }, [orders, q, activeStatus])

    // reset to page 1 when filters change
    useMemo(() => {
        setPage(1)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q, activeStatus])

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
    const pageItems = useMemo(() => {
        const start = (page - 1) * pageSize
        return filtered.slice(start, start + pageSize)
    }, [filtered, page, pageSize])

    const setOrderNote = (orderId, value) => {
        setNotes((prev) => ({ ...prev, [orderId]: value }))
    }

    const openOrder = (order) => {
        setSelected(order)
        setOpen(true)
    }

    const canApprove = (o) => {
        if (o.status !== "pending") return false
        if (!o.requiresPrescription) return true
        return !!o.prescription?.url // must be uploaded first
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Orders</h1>
                    <p className="text-sm text-muted-foreground">
                        Review prescriptions, approve orders, and update delivery status.
                    </p>
                </div>

                {/* Search */}
                <div className="w-full md:w-[420px] flex items-center gap-2 rounded-xl border bg-background p-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search by user, email, status, city, id..."
                        className="border-0 shadow-none focus-visible:ring-0"
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Orders" value={stats.total} icon={<FileText className="w-5 h-5" />} />
                <StatCard title="Pending" value={stats.pending} icon={<Clock className="w-5 h-5" />} />
                <StatCard title="Prescription Needed" value={stats.rxNeeded} icon={<CheckCircle2 className="w-5 h-5" />} />
                <StatCard title="Revenue (KES)" value={moneyKES(stats.revenue)} icon={<BadgeCheck className="w-5 h-5" />} />
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
                {statusTabs.map((s) => (
                    <Button
                        key={s}
                        variant={activeStatus === s ? "default" : "outline"}
                        onClick={() => setActiveStatus(s)}
                    >
                        {s}
                    </Button>
                ))}
            </div>

            {error && (
                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                    {error}
                </div>
            )}

            {/* List */}
            <div>
                {isLoading && <p>Loading orders...</p>}
                {isError && <p className="text-destructive">Failed to load orders.</p>}

                {!isLoading && !isError && filtered.length === 0 && (
                    <p className="text-muted-foreground">No orders found.</p>
                )}

                <div className="grid gap-4 mt-4">
                    {pageItems.map((o) => {
                        const noteValue = notes[o._id] ?? ""
                        const createdAt = o.createdAt ? new Date(o.createdAt).toLocaleString() : "-"
                        const items = o.orderItems || []
                        const firstTwo = items.slice(0, 2)
                        const moreCount = Math.max(0, items.length - 2)

                        const rx = !!o.requiresPrescription
                        const rxUploaded = !!o.prescription?.url

                        return (
                            <Card key={o._id} className="overflow-hidden">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold">Order #{String(o._id).slice(-6)}</span>
                                            <StatusBadge status={o.status} />
                                            {rx && (
                                                <span className="text-xs px-2 py-1 rounded-full border bg-secondary">
                                                    Prescription
                                                </span>
                                            )}
                                            {o.isPaid && (
                                                <span className="text-xs px-2 py-1 rounded-full border bg-emerald-500/10">
                                                    Paid
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="text-sm text-muted-foreground">
                                                KES <span className="font-semibold">{moneyKES(o.totalPrice)}</span>
                                            </div>
                                            <Button variant="outline" size="sm" className="gap-2" onClick={() => openOrder(o)}>
                                                <Eye className="w-4 h-4" />
                                                View
                                            </Button>
                                        </div>
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Customer + Address */}
                                    <div className="grid gap-3 md:grid-cols-2 text-sm">
                                        <div className="space-y-1">
                                            <div>
                                                <b>Customer:</b> {o.user?.name}{" "}
                                                <span className="text-muted-foreground">({o.user?.email})</span>
                                            </div>
                                            <div className="text-muted-foreground">Created: {createdAt}</div>
                                            <div>
                                                <b>Phone:</b>{" "}
                                                <span className="text-muted-foreground">
                                                    {o.shippingAddress?.phone || "-"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div>
                                                <b>Address:</b>{" "}
                                                <span className="text-muted-foreground">
                                                    {o.shippingAddress?.street || "-"},{" "}
                                                    {o.shippingAddress?.city || "-"},{" "}
                                                    {o.shippingAddress?.county || "-"}
                                                </span>
                                            </div>
                                            <div>
                                                <b>Payment:</b>{" "}
                                                <span className="text-muted-foreground">
                                                    {o.paymentMethod || "-"} • {o.isPaid ? "Paid" : "Not paid"}
                                                </span>
                                            </div>
                                            <div>
                                                <b>Items:</b>{" "}
                                                <span className="text-muted-foreground">{items.length}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items preview */}
                                    <div className="rounded-lg border bg-muted/30 p-3">
                                        <div className="text-xs text-muted-foreground mb-2">Order items</div>
                                        <div className="space-y-1 text-sm">
                                            {firstTwo.map((it) => (
                                                <div key={it.product || it.name} className="flex items-center justify-between">
                                                    <span className="line-clamp-1">
                                                        {it.name} <span className="text-muted-foreground">x{it.qty}</span>
                                                    </span>
                                                    <span className="text-muted-foreground">KES {moneyKES(it.price)}</span>
                                                </div>
                                            ))}
                                            {moreCount > 0 && (
                                                <div className="text-xs text-muted-foreground">
                                                    +{moreCount} more item(s)
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Prescription */}
                                    {rx && (
                                        <div className="space-y-2">
                                            {!rxUploaded && (
                                                <div className="text-sm text-destructive">
                                                    Prescription not uploaded yet.
                                                </div>
                                            )}
                                            {rxUploaded && (
                                                <Button
                                                    variant="outline"
                                                    onClick={() => window.open(o.prescription.url, "_blank")}
                                                >
                                                    View Prescription
                                                </Button>
                                            )}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="space-y-2">
                                        {o.status === "pending" && (
                                            <>
                                                <Input
                                                    value={noteValue}
                                                    onChange={(e) => setOrderNote(o._id, e.target.value)}
                                                    placeholder="Pharmacist note (optional)"
                                                />

                                                <div className="flex gap-2 flex-wrap">
                                                    <Button
                                                        onClick={() => {
                                                            setError(null)
                                                            decideMutation.mutate({
                                                                orderId: o._id,
                                                                action: "approve",
                                                                pharmacistNote: noteValue,
                                                            })
                                                        }}
                                                        disabled={decideMutation.isPending || !canApprove(o)}
                                                        className="gap-2"
                                                        title={
                                                            !canApprove(o) && o.requiresPrescription
                                                                ? "Cannot approve until prescription is uploaded"
                                                                : ""
                                                        }
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                        Approve
                                                    </Button>

                                                    <Button
                                                        variant="destructive"
                                                        onClick={() => {
                                                            setError(null)
                                                            decideMutation.mutate({
                                                                orderId: o._id,
                                                                action: "reject",
                                                                pharmacistNote: noteValue,
                                                            })
                                                        }}
                                                        disabled={decideMutation.isPending}
                                                        className="gap-2"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                        Reject
                                                    </Button>
                                                </div>

                                                {rx && !rxUploaded && (
                                                    <div className="text-xs text-muted-foreground">
                                                        Approve is disabled until the customer uploads a prescription.
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {o.status === "approved" && (
                                            <Button
                                                onClick={() =>
                                                    statusMutation.mutate({ orderId: o._id, status: "dispatched" })
                                                }
                                                disabled={statusMutation.isPending}
                                                className="gap-2"
                                            >
                                                <Truck className="w-4 h-4" />
                                                Mark Dispatched
                                            </Button>
                                        )}

                                        {o.status === "dispatched" && (
                                            <Button
                                                onClick={() =>
                                                    statusMutation.mutate({ orderId: o._id, status: "delivered" })
                                                }
                                                disabled={statusMutation.isPending}
                                                className="gap-2"
                                            >
                                                <PackageCheck className="w-4 h-4" />
                                                Mark Delivered
                                            </Button>
                                        )}

                                        {o.pharmacistNote && (
                                            <div className="rounded-lg border p-3 bg-muted/30">
                                                <div className="text-xs text-muted-foreground mb-1">Pharmacist note</div>
                                                <div className="text-sm">{o.pharmacistNote}</div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {/* Pagination */}
                {!isLoading && !isError && filtered.length > 0 && (
                    <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-muted-foreground">
                            Page <b>{page}</b> of <b>{totalPages}</b> • Showing{" "}
                            <b>{pageItems.length}</b> of <b>{filtered.length}</b>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page <= 1}
                            >
                                Prev
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page >= totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Order Modal */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>
                            Order Details {selected?._id ? `#${String(selected._id).slice(-6)}` : ""}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Full order breakdown, customer and delivery information.
                        </DialogDescription>
                    </DialogHeader>

                    {!selected ? (
                        <div className="text-sm text-muted-foreground">No order selected.</div>
                    ) : (
                        <div className="space-y-4">
                            {/* Top meta */}
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <StatusBadge status={selected.status} />
                                    {selected.requiresPrescription && (
                                        <span className="text-xs px-2 py-1 rounded-full border bg-secondary">
                                            Prescription
                                        </span>
                                    )}
                                    {selected.isPaid && (
                                        <span className="text-xs px-2 py-1 rounded-full border bg-emerald-500/10">
                                            Paid
                                        </span>
                                    )}
                                </div>

                                <div className="text-sm">
                                    Total: <b>KES {moneyKES(selected.totalPrice)}</b>
                                </div>
                            </div>

                            {/* Customer + Address */}
                            <div className="grid gap-3 md:grid-cols-2 text-sm">
                                <div className="rounded-lg border p-3">
                                    <div className="font-semibold mb-2">Customer</div>
                                    <div><b>Name:</b> {selected.user?.name || "-"}</div>
                                    <div><b>Email:</b> {selected.user?.email || "-"}</div>
                                    <div><b>Phone:</b> {selected.shippingAddress?.phone || "-"}</div>
                                    <div className="text-xs text-muted-foreground mt-2">
                                        Created: {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : "-"}
                                    </div>
                                </div>

                                <div className="rounded-lg border p-3">
                                    <div className="font-semibold mb-2">Delivery</div>
                                    <div>
                                        <b>Address:</b>{" "}
                                        {selected.shippingAddress?.street || "-"},{" "}
                                        {selected.shippingAddress?.city || "-"},{" "}
                                        {selected.shippingAddress?.county || "-"}
                                    </div>
                                    <div className="mt-2">
                                        <b>Payment:</b> {selected.paymentMethod || "-"} •{" "}
                                        {selected.isPaid ? "Paid" : "Not paid"}
                                    </div>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="rounded-lg border p-3">
                                <div className="font-semibold mb-2">Items</div>
                                <div className="space-y-2">
                                    {(selected.orderItems || []).map((it, idx) => (
                                        <div
                                            key={(it.product || it.name || idx) + idx}
                                            className="flex items-center justify-between text-sm border rounded p-2"
                                        >
                                            <div className="min-w-0">
                                                <div className="font-medium line-clamp-1">{it.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    Qty: {it.qty} • Price: KES {moneyKES(it.price)}
                                                </div>
                                            </div>
                                            <div className="font-semibold">
                                                KES {moneyKES(Number(it.qty || 0) * Number(it.price || 0))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Totals */}
                                <div className="mt-3 text-sm space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Items</span>
                                        <b>KES {moneyKES(selected.itemsPrice)}</b>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Shipping</span>
                                        <b>KES {moneyKES(selected.shippingPrice)}</b>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Total</span>
                                        <b>KES {moneyKES(selected.totalPrice)}</b>
                                    </div>
                                </div>
                            </div>

                            {/* Prescription */}
                            {selected.requiresPrescription && (
                                <div className="rounded-lg border p-3">
                                    <div className="font-semibold mb-2">Prescription</div>
                                    {selected.prescription?.url ? (
                                        <Button
                                            variant="outline"
                                            onClick={() => window.open(selected.prescription.url, "_blank")}
                                        >
                                            View Prescription
                                        </Button>
                                    ) : (
                                        <div className="text-sm text-destructive">
                                            Not uploaded yet.
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Pharmacist note */}
                            {selected.pharmacistNote && (
                                <div className="rounded-lg border p-3 bg-muted/30">
                                    <div className="text-xs text-muted-foreground mb-1">Pharmacist note</div>
                                    <div className="text-sm">{selected.pharmacistNote}</div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
