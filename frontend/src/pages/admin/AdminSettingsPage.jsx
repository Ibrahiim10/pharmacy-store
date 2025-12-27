import { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Save, Store, Shield, CreditCard, Truck, Image as ImageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import { fetchSettings, updateSettings } from "@/lib/api/admin.api"

const defaultSettings = {
    storeName: "Pharmacy Store",
    storeEmail: "",
    storePhone: "",
    whatsappNumber: "254719583400",
    address: "Nairobi, Kenya",
    tagline: "Get Medicines With Ease",

    lowStockThreshold: 5,
    expiringSoonDays: 30,
    autoDeactivateExpired: true,
    requireRxApprovalBeforeDispatch: true,

    deliveryEnabled: true,
    deliveryFee: 0,
    freeDeliveryMin: 0,

    mpesaEnabled: false,
    mpesaShortCode: "",
    mpesaPasskey: "",
    mpesaCallbackUrl: "",
    paymentNotes: "Cash on delivery and Card supported.",
}

function SectionTitle({ icon, title, desc }) {
    return (
        <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">{icon}</div>
            <div>
                <div className="font-semibold">{title}</div>
                {desc ? <div className="text-sm text-muted-foreground">{desc}</div> : null}
            </div>
        </div>
    )
}

export default function AdminSettingsPage() {
    const qc = useQueryClient()
    const [settings, setSettings] = useState(defaultSettings)
    const [status, setStatus] = useState({ type: null, message: "" })

    const { data, isLoading, isError } = useQuery({
        queryKey: ["adminSettings"],
        queryFn: fetchSettings,
        refetchOnWindowFocus: false,
    })

    useEffect(() => {
        if (data) {
            // merge server data into defaults
            setSettings((prev) => ({ ...prev, ...data }))
        }
    }, [data])

    const saveMutation = useMutation({
        mutationFn: updateSettings,
        onSuccess: () => {
            setStatus({ type: "success", message: "Settings saved successfully." })
            qc.invalidateQueries({ queryKey: ["adminSettings"] })
        },
        onError: (err) => {
            setStatus({ type: "error", message: err?.response?.data?.message || "Save failed." })
        },
    })

    const onChange = (e) => {
        const { name, value, type, checked } = e.target
        setSettings((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
    }

    const setNumber = (name, value) => {
        const n = Number(value)
        setSettings((prev) => ({ ...prev, [name]: Number.isNaN(n) ? 0 : n }))
    }

    const save = () => {
        setStatus({ type: null, message: "" })

        if (!settings.storeName.trim()) {
            setStatus({ type: "error", message: "Store name is required." })
            return
        }

        // remove mongoose fields if they exist in state
        const { _id, __v, createdAt, updatedAt, updatedBy, ...payload } = settings
        saveMutation.mutate(payload)
    }

    const badge = useMemo(() => {
        if (status.type === "success") return "bg-emerald-500/10 text-emerald-600"
        if (status.type === "error") return "bg-destructive/10 text-destructive"
        return ""
    }, [status])

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Settings</h1>
                    <p className="text-sm text-muted-foreground">
                        Configure your pharmacy store profile, rules, delivery and payments.
                    </p>
                </div>

                <Button onClick={save} className="gap-2" disabled={saveMutation.isPending}>
                    <Save className="w-4 h-4" />
                    {saveMutation.isPending ? "Saving..." : "Save Settings"}
                </Button>
            </div>

            {status.message && <div className={`p-3 rounded-md text-sm border ${badge}`}>{status.message}</div>}
            {isLoading && <p>Loading settings...</p>}
            {isError && <p className="text-destructive">Failed to load settings.</p>}

            {!isLoading && !isError && (
                <>
                    {/* Store Profile */}
                    <Card className="border-border">
                        <CardHeader>
                            <CardTitle className="text-base">
                                <SectionTitle icon={<Store className="w-5 h-5" />} title="Store Profile" desc="Displayed to customers." />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3 md:grid-cols-2">
                            <Input name="storeName" value={settings.storeName} onChange={onChange} placeholder="Store name" />
                            <Input name="tagline" value={settings.tagline} onChange={onChange} placeholder="Tagline" />
                            <Input name="storeEmail" value={settings.storeEmail} onChange={onChange} placeholder="Store email" type="email" />
                            <Input name="storePhone" value={settings.storePhone} onChange={onChange} placeholder="Store phone" />
                            <Input name="whatsappNumber" value={settings.whatsappNumber} onChange={onChange} placeholder="WhatsApp number (254...)" />
                            <Input name="address" value={settings.address} onChange={onChange} placeholder="Address" />
                        </CardContent>
                    </Card>

                    {/* Operations */}
                    <Card className="border-border">
                        <CardHeader>
                            <CardTitle className="text-base">
                                <SectionTitle icon={<Shield className="w-5 h-5" />} title="Operations & Rules" desc="Inventory + prescription rules." />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <div className="text-sm font-medium">Low stock threshold</div>
                                <Input type="number" min="0" value={settings.lowStockThreshold} onChange={(e) => setNumber("lowStockThreshold", e.target.value)} />
                            </div>

                            <div className="space-y-2">
                                <div className="text-sm font-medium">Expiring soon days</div>
                                <Input type="number" min="1" value={settings.expiringSoonDays} onChange={(e) => setNumber("expiringSoonDays", e.target.value)} />
                            </div>

                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" name="autoDeactivateExpired" checked={settings.autoDeactivateExpired} onChange={onChange} />
                                Auto-deactivate expired products
                            </label>

                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    name="requireRxApprovalBeforeDispatch"
                                    checked={settings.requireRxApprovalBeforeDispatch}
                                    onChange={onChange}
                                />
                                Require prescription approval before dispatch
                            </label>
                        </CardContent>
                    </Card>

                    {/* Delivery */}
                    <Card className="border-border">
                        <CardHeader>
                            <CardTitle className="text-base">
                                <SectionTitle icon={<Truck className="w-5 h-5" />} title="Delivery" desc="Configure delivery availability and pricing." />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" name="deliveryEnabled" checked={settings.deliveryEnabled} onChange={onChange} />
                                Enable delivery
                            </label>

                            <div className="space-y-2">
                                <div className="text-sm font-medium">Delivery fee (KES)</div>
                                <Input type="number" min="0" value={settings.deliveryFee} onChange={(e) => setNumber("deliveryFee", e.target.value)} />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <div className="text-sm font-medium">Free delivery minimum (KES)</div>
                                <Input type="number" min="0" value={settings.freeDeliveryMin} onChange={(e) => setNumber("freeDeliveryMin", e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payments */}
                    <Card className="border-border">
                        <CardHeader>
                            <CardTitle className="text-base">
                                <SectionTitle icon={<CreditCard className="w-5 h-5" />} title="Payments" desc="Enable Mpesa and configure settings." />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" name="mpesaEnabled" checked={settings.mpesaEnabled} onChange={onChange} />
                                Enable Mpesa payments
                            </label>

                            <div className="grid gap-3 md:grid-cols-2">
                                <Input name="mpesaShortCode" value={settings.mpesaShortCode} onChange={onChange} placeholder="Mpesa Short Code" disabled={!settings.mpesaEnabled} />
                                <Input name="mpesaPasskey" value={settings.mpesaPasskey} onChange={onChange} placeholder="Mpesa Passkey" disabled={!settings.mpesaEnabled} />
                                <Input name="mpesaCallbackUrl" value={settings.mpesaCallbackUrl} onChange={onChange} placeholder="Callback URL (STK push)" disabled={!settings.mpesaEnabled} />
                            </div>

                            <div className="space-y-2">
                                <div className="text-sm font-medium">Payment notes (shown to users)</div>
                                <Textarea
                                    value={settings.paymentNotes}
                                    onChange={(e) => setSettings((p) => ({ ...p, paymentNotes: e.target.value }))}
                                    placeholder="Example: Mpesa STK push, cash on delivery..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Brand placeholder */}
                    <Card className="border-border">
                        <CardHeader>
                            <CardTitle className="text-base">
                                <SectionTitle icon={<ImageIcon className="w-5 h-5" />} title="Brand Assets" desc="We can connect logo upload to Cloudinary next." />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            Logo upload can be connected to your existing Cloudinary upload flow anytime.
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}
