import { useMemo, useRef, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
    Search,
    Plus,
    Filter,
    Eye,
    Pencil,
    Trash2,
    ImagePlus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"

import {
    createProduct,
    deleteProduct,
    fetchProducts,
    updateProduct,
    uploadProductImage,
} from "@/lib/api/admin.api"

const emptyForm = {
    name: "",
    description: "",
    category: "",
    price: "",
    countInStock: "",
    prescriptionRequired: false,
    expiryDate: "",
    status: "active",
}

function money(v) {
    const n = Number(v || 0)
    return `KES ${n.toLocaleString()}`
}

function StockStatusPill({ stock }) {
    const s = Number(stock || 0)
    const base =
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border"

    if (s === 0) {
        return (
            <span className={`${base} bg-red-500/10 border-red-500/20 text-red-700`}>
                Out of Stock
            </span>
        )
    }

    if (s <= 5) {
        return (
            <span
                className={`${base} bg-yellow-500/10 border-yellow-500/20 text-yellow-800`}
            >
                Low Stock
            </span>
        )
    }

    return (
        <span
            className={`${base} bg-emerald-500/10 border-emerald-500/20 text-emerald-700`}
        >
            In Stock
        </span>
    )
}

function StockBar({ stock }) {
    const s = Number(stock || 0)
    // Visual only: cap at 100 for nice bar
    const pct = Math.max(0, Math.min(100, s >= 100 ? 100 : s))
    return (
        <div className="flex items-center gap-3">
            <div className="h-2 w-28 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-emerald-500/70" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-sm text-muted-foreground">{s}</span>
        </div>
    )
}

function TotalCard({ value }) {
    return (
        <Card className="border-border">
            <CardContent className="p-5 flex items-center justify-between">
                <div>
                    <div className="text-xs text-muted-foreground">Total Products</div>
                    <div className="text-3xl font-bold mt-1">{value}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <span className="text-sm">📦</span>
                </div>
            </CardContent>
        </Card>
    )
}

export default function AdminProductsPage() {
    const qc = useQueryClient()
    const fileRefs = useRef({})

    const [q, setQ] = useState("")
    const [filtersOpen, setFiltersOpen] = useState(false)
    const [status, setStatus] = useState("all") // all|active|inactive
    const [stockFilter, setStockFilter] = useState("all") // all|in|low|out
    const [rx, setRx] = useState("all") // all|true|false

    // modal
    const [open, setOpen] = useState(false)
    const [mode, setMode] = useState("create") // create|edit
    const [editingId, setEditingId] = useState(null)
    const [form, setForm] = useState(emptyForm)
    const [error, setError] = useState(null)

    const [uploadingForId, setUploadingForId] = useState(null)

    const params = useMemo(() => {
        const p = {}
        if (q.trim()) p.q = q.trim()
        if (status !== "all") p.status = status
        if (rx !== "all") p.prescription = rx
        // stockFilter handled client-side (or you can support backend later)
        return p
    }, [q, status, rx])

    const { data, isLoading, isError } = useQuery({
        queryKey: ["adminProducts", params],
        queryFn: () => fetchProducts(params),
        refetchOnWindowFocus: false,
    })

    // support both: array OR {items,total}
    const serverProducts = Array.isArray(data) ? data : data?.items || []
    const serverTotal = Array.isArray(data) ? serverProducts.length : data?.total ?? serverProducts.length

    const products = useMemo(() => {
        let list = [...serverProducts]

        if (stockFilter === "out") list = list.filter((p) => Number(p.countInStock || 0) === 0)
        if (stockFilter === "low") list = list.filter((p) => {
            const s = Number(p.countInStock || 0)
            return s > 0 && s <= 5
        })
        if (stockFilter === "in") list = list.filter((p) => Number(p.countInStock || 0) > 5)

        return list
    }, [serverProducts, stockFilter])

    const totalForCard = serverTotal

    const createMutation = useMutation({
        mutationFn: createProduct,
        onSuccess: () => {
            setError(null)
            setForm(emptyForm)
            setOpen(false)
            qc.invalidateQueries({ queryKey: ["adminProducts"] })
        },
        onError: (err) => setError(err?.response?.data?.message || "Create failed"),
    })

    const updateMutation = useMutation({
        mutationFn: updateProduct,
        onSuccess: () => {
            setError(null)
            setForm(emptyForm)
            setMode("create")
            setEditingId(null)
            setOpen(false)
            qc.invalidateQueries({ queryKey: ["adminProducts"] })
        },
        onError: (err) => setError(err?.response?.data?.message || "Update failed"),
    })

    const deleteMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["adminProducts"] }),
        onError: (err) => setError(err?.response?.data?.message || "Delete failed"),
    })

    const uploadMutation = useMutation({
        mutationFn: uploadProductImage,
        onSuccess: (_data, vars) => {
            setUploadingForId(null)
            qc.invalidateQueries({ queryKey: ["adminProducts"] })
            const ref = fileRefs.current?.[vars.id]
            if (ref) ref.value = ""
        },
        onError: (err) => {
            setUploadingForId(null)
            setError(err?.response?.data?.message || "Upload failed")
        },
    })

    const openCreate = () => {
        setError(null)
        setMode("create")
        setEditingId(null)
        setForm(emptyForm)
        setOpen(true)
    }

    const openEdit = (p) => {
        setError(null)
        setMode("edit")
        setEditingId(p._id)
        setForm({
            name: p.name || "",
            description: p.description || "",
            category: p.category || "",
            price: String(p.price ?? ""),
            countInStock: String(p.countInStock ?? ""),
            prescriptionRequired: !!p.prescriptionRequired,
            expiryDate: p.expiryDate ? String(p.expiryDate).slice(0, 10) : "",
            status: p.status || "active",
        })
        setOpen(true)
    }

    const onChange = (e) => {
        const { name, value, type, checked } = e.target
        setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
    }

    const submit = () => {
        setError(null)
        if (!form.name || !form.category || !form.expiryDate) {
            setError("Name, category, and expiry date are required")
            return
        }

        const payload = {
            name: form.name.trim(),
            description: form.description?.trim() || "",
            category: form.category.trim(),
            price: Number(form.price),
            countInStock: Number(form.countInStock),
            prescriptionRequired: !!form.prescriptionRequired,
            expiryDate: new Date(form.expiryDate).toISOString(),
            status: form.status,
        }

        if (Number.isNaN(payload.price) || payload.price < 0) return setError("Price must be valid")
        if (Number.isNaN(payload.countInStock) || payload.countInStock < 0) return setError("Stock must be valid")

        if (mode === "create") createMutation.mutate(payload)
        else updateMutation.mutate({ id: editingId, payload })
    }

    const handleUpload = (id, file) => {
        setError(null)
        if (!file) return
        if (!file.type.startsWith("image/")) return setError("Upload an image file (jpg/png/webp).")
        setUploadingForId(id)
        uploadMutation.mutate({ id, file })
    }

    return (
        <div className="space-y-6">
            {/* Header like screenshot */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Product Management</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage your products, inventory, and pricing
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => setFiltersOpen((v) => !v)}
                    >
                        <Filter className="w-4 h-4" />
                        Filter
                    </Button>

                    <Button className="gap-2" onClick={openCreate}>
                        <Plus className="w-4 h-4" />
                        Add Product
                    </Button>
                </div>
            </div>

            {/* Search + Total card row like screenshot */}
            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
                <div className="space-y-3">
                    <div className="flex items-center gap-2 rounded-xl border bg-background px-3 py-2">
                        <Search className="w-4 h-4 text-muted-foreground" />
                        <Input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search products by name or category..."
                            className="border-0 shadow-none focus-visible:ring-0"
                        />
                    </div>

                    {/* Filter panel */}
                    {filtersOpen && (
                        <Card className="border-border">
                            <CardContent className="p-4 grid gap-3 sm:grid-cols-3">
                                <select
                                    className="w-full border rounded-md p-2 bg-background text-sm"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    <option value="all">All status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>

                                <select
                                    className="w-full border rounded-md p-2 bg-background text-sm"
                                    value={stockFilter}
                                    onChange={(e) => setStockFilter(e.target.value)}
                                >
                                    <option value="all">All stock</option>
                                    <option value="in">In Stock</option>
                                    <option value="low">Low Stock</option>
                                    <option value="out">Out of Stock</option>
                                </select>

                                <select
                                    className="w-full border rounded-md p-2 bg-background text-sm"
                                    value={rx}
                                    onChange={(e) => setRx(e.target.value)}
                                >
                                    <option value="all">All (Rx)</option>
                                    <option value="true">Prescription only</option>
                                    <option value="false">No prescription</option>
                                </select>
                            </CardContent>
                        </Card>
                    )}

                    {error && (
                        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                            {error}
                        </div>
                    )}
                </div>

                <TotalCard value={totalForCard} />
            </div>

            {/* Table like screenshot */}
            <Card className="border-border overflow-hidden">
                <CardContent className="p-0">
                    {isLoading && <div className="p-4 text-sm">Loading products...</div>}
                    {isError && (
                        <div className="p-4 text-sm text-destructive">
                            Failed to load products.
                        </div>
                    )}

                    {!isLoading && !isError && products.length === 0 && (
                        <div className="p-4 text-sm text-muted-foreground">
                            No products found.
                        </div>
                    )}

                    {!isLoading && !isError && products.length > 0 && (
                        <div className="w-full overflow-x-auto">
                            <div className="min-w-[980px]">
                                {/* Head */}
                                <div className="grid grid-cols-[300px_150px_100px_180px_100px_80px] px-4 py-3 border-b text-xs text-muted-foreground">
                                    <div>PRODUCT</div>
                                    <div>CATEGORY</div>
                                    <div>PRICE</div>
                                    <div>STOCK</div>
                                    <div>STATUS</div>
                                    <div className="text-right">ACTIONS</div>
                                </div>

                                {/* Rows */}
                                {products.map((p) => (
                                    <div
                                        key={p._id}
                                        className="grid grid-cols-[300px_150px_100px_180px_100px_80px] px-4 py-4 border-b items-center"
                                    >
                                        {/* PRODUCT */}
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg border bg-muted overflow-hidden flex items-center justify-center">
                                                {p.image ? (
                                                    <img
                                                        src={p.image}
                                                        alt={p.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-[10px] text-muted-foreground">
                                                        No Img
                                                    </span>
                                                )}
                                            </div>

                                            <div className="min-w-0">
                                                <div className="font-semibold truncate">{p.name}</div>
                                                <div className="text-xs text-muted-foreground truncate">
                                                    {p.prescriptionRequired ? "Rx required" : "No Rx"}
                                                </div>

                                                {/* upload image button like pro */}
                                                <div className="mt-1">
                                                    <input
                                                        ref={(el) => (fileRefs.current[p._id] = el)}
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={(e) =>
                                                            handleUpload(p._id, e.target.files?.[0])
                                                        }
                                                    />
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 px-2 gap-2"
                                                        onClick={() => fileRefs.current[p._id]?.click()}
                                                        disabled={uploadingForId === p._id}
                                                    >
                                                        <ImagePlus className="w-4 h-4" />
                                                        {uploadingForId === p._id ? "Uploading..." : "Image"}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* CATEGORY */}
                                        <div className="text-sm text-muted-foreground">{p.category}</div>

                                        {/* PRICE */}
                                        <div className="text-sm font-semibold">{money(p.price)}</div>

                                        {/* STOCK */}
                                        <div>
                                            <StockBar stock={p.countInStock} />
                                        </div>

                                        {/* STATUS */}
                                        <div>
                                            <StockStatusPill stock={p.countInStock} />
                                        </div>

                                        {/* ACTIONS */}
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => alert(`View: ${p.name}`)}
                                                title="View"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>

                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => openEdit(p)}
                                                title="Edit"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>

                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => {
                                                    setError(null)
                                                    if (confirm(`Delete "${p.name}"?`)) deleteMutation.mutate(p._id)
                                                }}
                                                disabled={deleteMutation.isPending}
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add/Edit Modal (clean like pro) */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[640px]">
                    <DialogHeader>
                        <DialogTitle>
                            {mode === "create" ? "Add Product" : "Edit Product"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Input name="name" value={form.name} onChange={onChange} placeholder="Product name" />
                            <Input name="category" value={form.category} onChange={onChange} placeholder="Category" />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <Input name="price" value={form.price} onChange={onChange} placeholder="Price" type="number" min="0" />
                            <Input name="countInStock" value={form.countInStock} onChange={onChange} placeholder="Stock" type="number" min="0" />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <Input name="expiryDate" value={form.expiryDate} onChange={onChange} type="date" />
                            <select
                                name="status"
                                value={form.status}
                                onChange={onChange}
                                className="w-full border rounded-md p-2 bg-background text-sm"
                            >
                                <option value="active">active</option>
                                <option value="inactive">inactive</option>
                            </select>
                        </div>

                        <Input
                            name="description"
                            value={form.description}
                            onChange={onChange}
                            placeholder="Description (optional)"
                        />

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                name="prescriptionRequired"
                                checked={form.prescriptionRequired}
                                onChange={onChange}
                            />
                            Prescription required
                        </label>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={submit}
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            {mode === "create"
                                ? createMutation.isPending
                                    ? "Creating..."
                                    : "Create"
                                : updateMutation.isPending
                                    ? "Updating..."
                                    : "Update"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
