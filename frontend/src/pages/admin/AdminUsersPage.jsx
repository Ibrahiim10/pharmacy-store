import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
    Search,
    UserPlus,
    Trash2,
    Pencil,
    KeyRound,
    Users,
    Shield,
    Stethoscope,
    MoreVertical,
    Mail,
    Phone,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

// shadcn (if you have them)
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
    fetchUsersAdmin,
    createUserAdmin,
    updateUserAdmin,
    deleteUserAdmin,
    resetUserPasswordAdmin,
} from "@/lib/api/admin.api"

const emptyForm = {
    name: "",
    email: "",
    password: "",
    role: "user",
    profilePic: "",
    status: "active",
    phone: "",
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

function Badge({ children, variant = "default" }) {
    const base = "inline-flex items-center rounded-full border px-2 py-0.5 text-xs"
    const styles =
        variant === "active"
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700"
            : variant === "pending"
                ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-700"
                : variant === "disabled"
                    ? "bg-zinc-500/10 border-zinc-500/20 text-zinc-700"
                    : "bg-muted/40"

    return <span className={`${base} ${styles}`}>{children}</span>
}

function getInitials(name) {
    const n = String(name || "").trim()
    if (!n) return "U"
    const parts = n.split(" ").filter(Boolean)
    const first = parts[0]?.[0] || "U"
    const second = parts[1]?.[0] || ""
    return (first + second).toUpperCase()
}

export default function AdminUsersPage() {
    const qc = useQueryClient()

    const [q, setQ] = useState("")
    const [role, setRole] = useState("All")
    const [status, setStatus] = useState("All")

    const [open, setOpen] = useState(false)
    const [mode, setMode] = useState("create") // create | edit
    const [editingId, setEditingId] = useState(null)
    const [form, setForm] = useState(emptyForm)
    const [error, setError] = useState(null)

    const { data: users = [], isLoading, isError } = useQuery({
        queryKey: ["adminUsers", q, role, status],
        queryFn: () => fetchUsersAdmin({ q, role, status }),
        refetchOnWindowFocus: false,
    })

    const createMutation = useMutation({
        mutationFn: createUserAdmin,
        onSuccess: () => {
            setError(null)
            setForm(emptyForm)
            setOpen(false)
            qc.invalidateQueries({ queryKey: ["adminUsers"] })
        },
        onError: (err) => setError(err?.response?.data?.message || "Create failed"),
    })

    const updateMutation = useMutation({
        mutationFn: updateUserAdmin,
        onSuccess: () => {
            setError(null)
            setForm(emptyForm)
            setMode("create")
            setEditingId(null)
            setOpen(false)
            qc.invalidateQueries({ queryKey: ["adminUsers"] })
        },
        onError: (err) => setError(err?.response?.data?.message || "Update failed"),
    })

    const deleteMutation = useMutation({
        mutationFn: deleteUserAdmin,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["adminUsers"] }),
        onError: (err) => setError(err?.response?.data?.message || "Delete failed"),
    })

    const resetPassMutation = useMutation({
        mutationFn: resetUserPasswordAdmin,
        onSuccess: () => setError(null),
        onError: (err) => setError(err?.response?.data?.message || "Reset password failed"),
    })

    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase()
        let list = users

        if (role !== "All") list = list.filter((u) => (u.role || "").toLowerCase() === role)
        if (status !== "All") list = list.filter((u) => (u.status || "active").toLowerCase() === status)

        if (!term) return list
        return list.filter((u) => {
            const name = (u.name || "").toLowerCase()
            const email = (u.email || "").toLowerCase()
            const r = (u.role || "").toLowerCase()
            return name.includes(term) || email.includes(term) || r.includes(term)
        })
    }, [users, q, role, status])

    const stats = useMemo(() => {
        const total = users.length
        const admins = users.filter((u) => u.role === "admin").length
        const pharmacists = users.filter((u) => u.role === "pharmacist").length
        return { total, admins, pharmacists }
    }, [users])

    const openCreate = () => {
        setError(null)
        setMode("create")
        setEditingId(null)
        setForm(emptyForm)
        setOpen(true)
    }

    const openEdit = (u) => {
        setError(null)
        setMode("edit")
        setEditingId(u._id)
        setForm({
            name: u.name || "",
            email: u.email || "",
            password: "",
            role: u.role || "user",
            profilePic: u.profilePic || "",
            status: u.status || "active",
            phone: u.phone || "",
        })
        setOpen(true)
    }

    const onChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const submit = () => {
        setError(null)

        if (!form.name.trim() || !form.email.trim()) {
            setError("Name and email are required")
            return
        }

        if (mode === "create") {
            if (!form.password || form.password.length < 6) {
                setError("Password must be at least 6 characters")
                return
            }
            createMutation.mutate({
                name: form.name.trim(),
                email: form.email.trim(),
                password: form.password,
                role: form.role,
                profilePic: form.profilePic.trim(),
                status: form.status,
                phone: form.phone.trim(),
            })
        } else {
            updateMutation.mutate({
                id: editingId,
                payload: {
                    name: form.name.trim(),
                    role: form.role,
                    profilePic: form.profilePic.trim(),
                    status: form.status,
                    phone: form.phone.trim(),
                },
            })
        }
    }

    const resetPassword = (id, email) => {
        setError(null)
        const newPassword = prompt(`Enter new password for ${email} (min 6 chars):`)
        if (!newPassword) return
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters")
            return
        }
        resetPassMutation.mutate({ id, newPassword })
    }

    const inlineUpdate = (id, payload) => {
        setError(null)
        updateMutation.mutate({ id, payload })
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">User Management</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage user accounts, roles, and permissions.
                    </p>
                </div>

                <Button className="gap-2 w-full md:w-auto" onClick={openCreate}>
                    <UserPlus className="w-4 h-4" />
                    Add User
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard title="Total Users" value={stats.total} icon={<Users className="w-5 h-5" />} />
                <StatCard title="Pharmacists" value={stats.pharmacists} icon={<Stethoscope className="w-5 h-5" />} />
                <StatCard title="Admins" value={stats.admins} icon={<Shield className="w-5 h-5" />} />
            </div>

            {/* Controls */}
            <Card className="border-border">
                <CardContent className="p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-2 rounded-xl border bg-background p-2 w-full md:w-[420px]">
                        <Search className="w-4 h-4 text-muted-foreground" />
                        <Input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search users by name, email, or role..."
                            className="border-0 shadow-none focus-visible:ring-0"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="border rounded-md px-3 py-2 text-sm bg-background"
                        >
                            <option value="All">Filter by Role</option>
                            <option value="user">user</option>
                            <option value="pharmacist">pharmacist</option>
                            <option value="admin">admin</option>
                        </select>

                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="border rounded-md px-3 py-2 text-sm bg-background"
                        >
                            <option value="All">Filter by Status</option>
                            <option value="active">active</option>
                            <option value="pending">pending</option>
                            <option value="disabled">disabled</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Errors */}
            {error && (
                <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                    {error}
                </div>
            )}

            {/* Table */}
            <Card className="border-border overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Users</CardTitle>
                </CardHeader>

                <CardContent className="p-0">
                    {isLoading && <div className="p-4 text-sm">Loading users...</div>}
                    {isError && <div className="p-4 text-sm text-destructive">Failed to load users.</div>}

                    {!isLoading && !isError && filtered.length === 0 && (
                        <div className="p-4 text-sm text-muted-foreground">No users found.</div>
                    )}

                    {!isLoading && !isError && filtered.length > 0 && (
                        <div className="w-full overflow-x-auto">
                            <div className="min-w-[880px]">
                                {/* Head */}
                                <div className="grid grid-cols-[320px_220px_140px_120px_120px_80px] gap-2 px-4 py-3 border-b text-xs text-muted-foreground">
                                    <div>USER</div>
                                    <div>CONTACT</div>
                                    <div>ROLE</div>
                                    <div>STATUS</div>
                                    <div>JOINED</div>
                                    <div className="text-right">ACTIONS</div>
                                </div>

                                {/* Rows */}
                                {filtered.map((u) => {
                                    const joined = u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"
                                    const username = (u.email || "").split("@")[0] || ""
                                    const statusValue = (u.status || "active").toLowerCase()

                                    return (
                                        <div
                                            key={u._id}
                                            className="grid grid-cols-[320px_220px_140px_120px_120px_80px] gap-2 px-4 py-3 border-b items-center"
                                        >
                                            {/* User */}
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full overflow-hidden border bg-muted flex items-center justify-center">
                                                    {u.profilePic ? (
                                                        <img
                                                            src={u.profilePic}
                                                            alt={u.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-xs font-semibold text-muted-foreground">
                                                            {getInitials(u.name)}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="font-semibold truncate">{u.name || "Unnamed"}</div>
                                                    <div className="text-xs text-muted-foreground truncate">
                                                        @{username}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Contact */}
                                            <div className="text-sm">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Mail className="w-4 h-4" />
                                                    <span className="truncate">{u.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                                                    <Phone className="w-4 h-4" />
                                                    <span className="truncate">{u.phone || "-"}</span>
                                                </div>
                                            </div>

                                            {/* Role (inline) */}
                                            <div>
                                                <select
                                                    value={u.role || "user"}
                                                    onChange={(e) => inlineUpdate(u._id, { role: e.target.value })}
                                                    className="border rounded-md px-2 py-1 text-sm bg-background w-full"
                                                    disabled={updateMutation.isPending}
                                                >
                                                    <option value="user">user</option>
                                                    <option value="pharmacist">pharmacist</option>
                                                    <option value="admin">admin</option>
                                                </select>
                                            </div>

                                            {/* Status (inline) */}
                                            <div className="flex items-center gap-2">
                                                <Badge variant={statusValue}>{statusValue}</Badge>
                                                <select
                                                    value={statusValue}
                                                    onChange={(e) => inlineUpdate(u._id, { status: e.target.value })}
                                                    className="border rounded-md px-2 py-1 text-xs bg-background"
                                                    disabled={updateMutation.isPending}
                                                >
                                                    <option value="active">active</option>
                                                    <option value="pending">pending</option>
                                                    <option value="disabled">disabled</option>
                                                </select>
                                            </div>

                                            {/* Joined */}
                                            <div className="text-sm text-muted-foreground">{joined}</div>

                                            {/* Actions */}
                                            <div className="flex justify-end">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" size="icon">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => openEdit(u)}>
                                                            <Pencil className="w-4 h-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem
                                                            onClick={() => resetPassword(u._id, u.email)}
                                                            disabled={resetPassMutation.isPending}
                                                        >
                                                            <KeyRound className="w-4 h-4 mr-2" />
                                                            Reset Password
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => {
                                                                setError(null)
                                                                if (confirm(`Delete user "${u.email}"?`)) {
                                                                    deleteMutation.mutate(u._id)
                                                                }
                                                            }}
                                                            disabled={deleteMutation.isPending}
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            {deleteMutation.isPending ? "Deleting..." : "Delete"}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add/Edit Modal */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[520px]">
                    <DialogHeader>
                        <DialogTitle>
                            {mode === "create" ? "Add User" : "Edit User"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Input
                                name="name"
                                value={form.name}
                                onChange={onChange}
                                placeholder="Full name"
                            />

                            <Input
                                name="email"
                                value={form.email}
                                onChange={onChange}
                                placeholder="Email"
                                type="email"
                                disabled={mode === "edit"}
                            />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            {mode === "create" && (
                                <Input
                                    name="password"
                                    value={form.password}
                                    onChange={onChange}
                                    placeholder="Password (min 6 chars)"
                                    type="password"
                                />
                            )}

                            <Input
                                name="phone"
                                value={form.phone}
                                onChange={onChange}
                                placeholder="Phone (optional)"
                            />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <select
                                name="role"
                                value={form.role}
                                onChange={onChange}
                                className="w-full border rounded-md p-2 bg-background text-sm"
                            >
                                <option value="user">user</option>
                                <option value="pharmacist">pharmacist</option>
                                <option value="admin">admin</option>
                            </select>

                            <select
                                name="status"
                                value={form.status}
                                onChange={onChange}
                                className="w-full border rounded-md p-2 bg-background text-sm"
                            >
                                <option value="active">active</option>
                                <option value="pending">pending</option>
                                <option value="disabled">disabled</option>
                            </select>
                        </div>

                        <Input
                            name="profilePic"
                            value={form.profilePic}
                            onChange={onChange}
                            placeholder="Profile picture URL (optional)"
                        />
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
