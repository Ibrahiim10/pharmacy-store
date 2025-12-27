import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
    FileText,
    Search,
    Clock,
    BadgeCheck,
    XCircle,
    CheckCircle2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import { fetchAllOrders, decideOrder } from "@/lib/api/admin.api"

const tabs = [
    { key: "waiting_upload", label: "Waiting Upload" },
    { key: "pending_review", label: "Pending Review" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
    { key: "all", label: "All" },
]

function Pill({ children }) {
    return (
        <span className="text-xs px-2 py-1 rounded-full border bg-muted/40 inline-flex items-center">
            {children}
        </span>
    )
}

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

    return <span className={base}>{status}</span>
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

export default function AdminPrescriptionsPage() {
    const qc = useQueryClient()

    const [q, setQ] = useState("")
    const [activeTab, setActiveTab] = useState("waiting_upload")
    const [notes, setNotes] = useState({}) // { [orderId]: string }
    const [error, setError] = useState(null)

    const { data: orders = [], isLoading, isError } = useQuery({
        queryKey: ["adminOrders"],
        queryFn: fetchAllOrders,
        refetchOnWindowFocus: false,
    })

    const decideMutation = useMutation({
        mutationFn: decideOrder,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["adminOrders"] })
        },
        onError: (err) => {
            setError(err?.response?.data?.message || err.message || "Decision failed")
        },
    })

    const rxOrders = useMemo(() => {
        return (orders || []).filter((o) => o.requiresPrescription)
    }, [orders])

    // Stats
    const stats = useMemo(() => {
        const total = rxOrders.length
        const waitingUpload = rxOrders.filter((o) => !o.prescription?.url).length
        const pendingReview = rxOrders.filter((o) => !!o.prescription?.url && o.status === "pending").length
        const approved = rxOrders.filter((o) => o.status === "approved").length
        const rejected = rxOrders.filter((o) => o.status === "rejected").length
        return { total, waitingUpload, pendingReview, approved, rejected }
    }, [rxOrders])

    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase()
        let list = rxOrders

        // Tab logic
        if (activeTab === "waiting_upload") {
            list = list.filter((o) => !o.prescription?.url)
        } else if (activeTab === "pending_review") {
            list = list.filter((o) => !!o.prescription?.url && o.status === "pending")
        } else if (activeTab === "approved") {
            list = list.filter((o) => o.status === "approved")
        } else if (activeTab === "rejected") {
            list = list.filter((o) => o.status === "rejected")
        } // all => no extra filter

        if (!term) return list

        return list.filter((o) => {
            const id = String(o._id || "").toLowerCase()
            const name = String(o.user?.name || "").toLowerCase()
            const email = String(o.user?.email || "").toLowerCase()
            const status = String(o.status || "").toLowerCase()
            const city = String(o.shippingAddress?.city || "").toLowerCase()
            const county = String(o.shippingAddress?.county || "").toLowerCase()

            return (
                id.includes(term) ||
                name.includes(term) ||
                email.includes(term) ||
                status.includes(term) ||
                city.includes(term) ||
                county.includes(term)
            )
        })
    }, [rxOrders, q, activeTab])

    const setOrderNote = (orderId, value) => {
        setNotes((prev) => ({ ...prev, [orderId]: value }))
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Prescriptions</h1>
                    <p className="text-sm text-muted-foreground">
                        Review prescription uploads and approve/reject pharmacy orders.
                    </p>
                </div>

                {/* Search */}
                <div className="w-full md:w-[420px] flex items-center gap-2 rounded-xl border bg-background p-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search by user, email, city, status, id..."
                        className="border-0 shadow-none focus-visible:ring-0"
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <StatCard title="Total Rx Orders" value={stats.total} icon={<FileText className="w-5 h-5" />} />
                <StatCard title="Waiting Upload" value={stats.waitingUpload} icon={<Clock className="w-5 h-5" />} />
                <StatCard title="Pending Review" value={stats.pendingReview} icon={<FileText className="w-5 h-5" />} />
                <StatCard title="Approved" value={stats.approved} icon={<BadgeCheck className="w-5 h-5" />} />
                <StatCard title="Rejected" value={stats.rejected} icon={<XCircle className="w-5 h-5" />} />
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
                {tabs.map((t) => (
                    <Button
                        key={t.key}
                        variant={activeTab === t.key ? "default" : "outline"}
                        onClick={() => setActiveTab(t.key)}
                    >
                        {t.label}
                    </Button>
                ))}
            </div>

            {/* Errors */}
            {error && (
                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                    {error}
                </div>
            )}

            {/* List */}
            <div>
                {isLoading && <p>Loading prescriptions...</p>}
                {isError && <p className="text-destructive">Failed to load prescriptions.</p>}

                {!isLoading && !isError && filtered.length === 0 && (
                    <p className="text-muted-foreground">No prescription orders found.</p>
                )}

                <div className="grid gap-4 mt-4">
                    {filtered.map((o) => {
                        const noteValue = notes[o._id] ?? ""
                        const createdAt = o.createdAt ? new Date(o.createdAt).toLocaleString() : "-"
                        const hasPrescription = !!o.prescription?.url

                        const items = o.orderItems || []
                        const firstTwo = items.slice(0, 2)
                        const moreCount = Math.max(0, items.length - 2)

                        return (
                            <Card key={o._id} className="overflow-hidden">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold">Rx Order #{String(o._id).slice(-6)}</span>
                                            <StatusBadge status={o.status} />
                                            <Pill>{hasPrescription ? "Prescription uploaded" : "No upload yet"}</Pill>
                                            <span className="text-xs text-muted-foreground">• {createdAt}</span>
                                        </div>

                                        <div className="text-sm text-muted-foreground">
                                            KES <span className="font-semibold">{o.totalPrice}</span>
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
                                            <div>
                                                <b>Phone:</b>{" "}
                                                <span className="text-muted-foreground">
                                                    {o.shippingAddress?.phone || "-"}
                                                </span>
                                            </div>
                                            <div>
                                                <b>Payment:</b>{" "}
                                                <span className="text-muted-foreground">
                                                    {o.paymentMethod || "-"} {o.isPaid ? "• Paid" : "• Not paid"}
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
                                                <div key={it.product} className="flex items-center justify-between">
                                                    <span className="line-clamp-1">
                                                        {it.name} <span className="text-muted-foreground">x{it.qty}</span>
                                                    </span>
                                                    <span className="text-muted-foreground">KES {it.price}</span>
                                                </div>
                                            ))}
                                            {moreCount > 0 && (
                                                <div className="text-xs text-muted-foreground">
                                                    +{moreCount} more item(s)
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Prescription actions */}
                                    <div className="flex flex-col gap-2">
                                        {!hasPrescription && (
                                            <div className="text-sm text-destructive">
                                                Customer has not uploaded a prescription yet.
                                            </div>
                                        )}

                                        {hasPrescription && (
                                            <Button
                                                variant="outline"
                                                onClick={() => window.open(o.prescription.url, "_blank")}
                                                className="w-fit"
                                            >
                                                View Prescription
                                            </Button>
                                        )}
                                    </div>

                                    {/* Decision actions */}
                                    {o.status === "pending" && hasPrescription && (
                                        <div className="space-y-2">
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
                                                    disabled={decideMutation.isPending}
                                                    className="gap-2"
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
                                        </div>
                                    )}

                                    {/* If pending but no prescription */}
                                    {o.status === "pending" && !hasPrescription && (
                                        <div className="text-xs text-muted-foreground">
                                            Waiting for customer upload. No action required yet.
                                        </div>
                                    )}

                                    {/* Show pharmacist note if exists */}
                                    {o.pharmacistNote && (
                                        <div className="rounded-lg border p-3 bg-muted/30">
                                            <div className="text-xs text-muted-foreground mb-1">Pharmacist note</div>
                                            <div className="text-sm">{o.pharmacistNote}</div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
