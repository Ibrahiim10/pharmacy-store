import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
    Search,
    RefreshCcw,
    PhoneCall,
    ReceiptText,
    CheckCircle2,
    XCircle,
    Clock,
    Eye,
    FileText,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"

import { fetchMpesaPayments } from "@/lib/api/admin.api"

const statusTabs = ["All", "pending", "success", "failed"]

function moneyKES(n) {
    const num = Number(n || 0)
    return new Intl.NumberFormat("en-KE").format(num)
}

function StatusPill({ status }) {
    const base = "text-xs px-2 py-1 rounded-full border inline-flex items-center gap-1"
    if (status === "success")
        return (
            <span className={`${base} bg-emerald-500/10`}>
                <CheckCircle2 className="w-3 h-3" /> success
            </span>
        )
    if (status === "failed")
        return (
            <span className={`${base} bg-red-500/10`}>
                <XCircle className="w-3 h-3" /> failed
            </span>
        )
    return (
        <span className={`${base} bg-yellow-500/10`}>
            <Clock className="w-3 h-3" /> {status}
        </span>
    )
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

export default function AdminPaymentsPage() {
    const [q, setQ] = useState("")
    const [activeStatus, setActiveStatus] = useState("All")

    const [open, setOpen] = useState(false)
    const [selected, setSelected] = useState(null)

    const { data: payments = [], isLoading, isError, refetch, isFetching } = useQuery({
        queryKey: ["adminMpesaPayments"],
        queryFn: () => fetchMpesaPayments(),
        refetchOnWindowFocus: false,
    })

    const stats = useMemo(() => {
        const total = payments.length
        const success = payments.filter((p) => p.status === "success").length
        const pending = payments.filter((p) => p.status === "pending").length
        const failed = payments.filter((p) => p.status === "failed").length
        const revenue = payments
            .filter((p) => p.status === "success")
            .reduce((sum, p) => sum + Number(p.amount || 0), 0)

        return { total, success, pending, failed, revenue }
    }, [payments])

    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase()

        let list = payments
        if (activeStatus !== "All") list = list.filter((p) => p.status === activeStatus)

        if (!term) return list

        return list.filter((p) => {
            const id = String(p._id || "").toLowerCase()
            const phone = String(p.phone || "").toLowerCase()
            const receipt = String(p.mpesa?.receipt || "").toLowerCase()
            const crid = String(p.mpesa?.checkoutRequestID || "").toLowerCase()
            const email = String(p.user?.email || "").toLowerCase()
            const orderId = String(p.order?._id || "").toLowerCase()

            return (
                id.includes(term) ||
                phone.includes(term) ||
                receipt.includes(term) ||
                crid.includes(term) ||
                email.includes(term) ||
                orderId.includes(term)
            )
        })
    }, [payments, q, activeStatus])

    const openDetails = (p) => {
        setSelected(p)
        setOpen(true)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Payments</h1>
                    <p className="text-sm text-muted-foreground">
                        Track M-Pesa STK payments and reconcile paid orders.
                    </p>
                </div>

                <Button variant="outline" className="gap-2" onClick={() => refetch()} disabled={isFetching}>
                    <RefreshCcw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <StatCard title="Total" value={stats.total} icon={<FileText className="w-5 h-5" />} />
                <StatCard title="Success" value={stats.success} icon={<CheckCircle2 className="w-5 h-5" />} />
                <StatCard title="Pending" value={stats.pending} icon={<Clock className="w-5 h-5" />} />
                <StatCard title="Failed" value={stats.failed} icon={<XCircle className="w-5 h-5" />} />
                <StatCard title="Revenue (KES)" value={moneyKES(stats.revenue)} icon={<ReceiptText className="w-5 h-5" />} />
            </div>

            {/* Search + Tabs */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="w-full md:w-[520px] flex items-center gap-2 rounded-xl border bg-background p-2">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search by receipt, checkout ID, phone, user email..."
                        className="border-0 shadow-none focus-visible:ring-0"
                    />
                </div>

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
            </div>

            {/* List */}
            <div>
                {isLoading && <p>Loading payments...</p>}
                {isError && <p className="text-destructive">Failed to load payments.</p>}

                {!isLoading && !isError && filtered.length === 0 && (
                    <p className="text-muted-foreground">No payments found.</p>
                )}

                <div className="grid gap-3 mt-3">
                    {filtered.map((p) => (
                        <Card key={p._id} className="border-border">
                            <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-semibold">Payment #{String(p._id).slice(-6)}</span>
                                        <StatusPill status={p.status} />
                                        <span className="text-xs px-2 py-1 rounded-full border bg-muted/40">
                                            mpesa
                                        </span>
                                    </div>

                                    <div className="text-sm text-muted-foreground">
                                        <span className="inline-flex items-center gap-1">
                                            <PhoneCall className="w-4 h-4" /> {p.phone || "-"}
                                        </span>
                                        <span className="mx-2">•</span>
                                        <span className="inline-flex items-center gap-1">
                                            <ReceiptText className="w-4 h-4" /> {p.mpesa?.receipt || "—"}
                                        </span>
                                    </div>

                                    <div className="text-xs text-muted-foreground">
                                        User: {p.user?.email || "-"} • Order #{String(p.order?._id || "").slice(-6)} •{" "}
                                        {p.createdAt ? new Date(p.createdAt).toLocaleString() : "-"}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="text-sm">
                                        KES <span className="font-semibold">{moneyKES(p.amount)}</span>
                                    </div>
                                    <Button variant="outline" className="gap-2" onClick={() => openDetails(p)}>
                                        <Eye className="w-4 h-4" />
                                        View
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Modal */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Payment Details</DialogTitle>
                        <DialogDescription>
                            Full M-Pesa transaction info and linked order.
                        </DialogDescription>
                    </DialogHeader>

                    {!selected ? (
                        <div className="text-sm text-muted-foreground">No payment selected.</div>
                    ) : (
                        <div className="space-y-4 text-sm">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">
                                        Payment #{String(selected._id).slice(-6)}
                                    </span>
                                    <StatusPill status={selected.status} />
                                </div>
                                <div>
                                    Amount: <b>KES {moneyKES(selected.amount)}</b>
                                </div>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                                <div className="rounded-lg border p-3 space-y-1">
                                    <div className="font-semibold mb-1">Customer</div>
                                    <div><b>Email:</b> <span className="text-muted-foreground">{selected.user?.email || "-"}</span></div>
                                    <div><b>Name:</b> <span className="text-muted-foreground">{selected.user?.name || "-"}</span></div>
                                    <div><b>Phone:</b> <span className="text-muted-foreground">{selected.phone || "-"}</span></div>
                                </div>

                                <div className="rounded-lg border p-3 space-y-1">
                                    <div className="font-semibold mb-1">Order</div>
                                    <div><b>Order ID:</b> <span className="text-muted-foreground">{selected.order?._id || "-"}</span></div>
                                    <div><b>Order paid:</b> <span className="text-muted-foreground">{selected.order?.isPaid ? "Yes" : "No"}</span></div>
                                    <div><b>Order total:</b> <span className="text-muted-foreground">KES {moneyKES(selected.order?.totalPrice)}</span></div>
                                </div>
                            </div>

                            <div className="rounded-lg border p-3 space-y-2">
                                <div className="font-semibold">M-Pesa</div>
                                <div className="grid gap-2 md:grid-cols-2">
                                    <div><b>Receipt:</b> <span className="text-muted-foreground">{selected.mpesa?.receipt || "-"}</span></div>
                                    <div><b>CheckoutRequestID:</b> <span className="text-muted-foreground">{selected.mpesa?.checkoutRequestID || "-"}</span></div>
                                    <div><b>MerchantRequestID:</b> <span className="text-muted-foreground">{selected.mpesa?.merchantRequestID || "-"}</span></div>
                                    <div><b>Result:</b> <span className="text-muted-foreground">{selected.mpesa?.resultCode || "-"}</span></div>
                                </div>
                                <div><b>Description:</b> <span className="text-muted-foreground">{selected.mpesa?.resultDesc || "-"}</span></div>
                                <div className="text-xs text-muted-foreground">
                                    Created: {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : "-"}
                                </div>
                            </div>

                            {/* Raw payload (optional) */}
                            <details className="rounded-lg border p-3">
                                <summary className="cursor-pointer text-sm font-semibold">Raw callback payload</summary>
                                <pre className="text-xs whitespace-pre-wrap mt-2">
                                    {JSON.stringify(selected.raw || {}, null, 2)}
                                </pre>
                            </details>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
