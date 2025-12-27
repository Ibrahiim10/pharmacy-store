import { useMemo, useState } from "react"
import { useMutation } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import useCartStore from "@/lib/store/cartStore"
import api from "@/lib/api/apiClient"
import { useNavigate } from "react-router"

function normalizeKenyaPhone(phone) {
    const p = String(phone || "").trim().replace(/\s+/g, "")
    if (!p) return ""
    if (p.startsWith("+")) return p.slice(1)
    if (p.startsWith("254")) return p
    if (p.startsWith("0")) return "254" + p.slice(1)
    if (p.startsWith("7")) return "254" + p
    return p
}

async function pollOrderPaid(orderId, { intervalMs = 3000, maxTries = 20 } = {}) {
    let tries = 0

    return new Promise((resolve, reject) => {
        const timer = setInterval(async () => {
            try {
                tries++

                const { data } = await api.get(`/orders/${orderId}`)
                if (data?.isPaid) {
                    clearInterval(timer)
                    resolve(data)
                    return
                }

                if (tries >= maxTries) {
                    clearInterval(timer)
                    reject(new Error("Payment not confirmed yet. Please check Orders page."))
                }
            } catch (err) {
                clearInterval(timer)
                reject(err)
            }
        }, intervalMs)
    })
}

export default function CheckoutPage() {
    const navigate = useNavigate()

    const items = useCartStore((s) => s.items)
    const clearCart = useCartStore((s) => s.clearCart)
    const cartTotal = useCartStore((s) => s.cartTotal())

    const [error, setError] = useState(null)
    const [info, setInfo] = useState(null)

    const [form, setForm] = useState({
        phone: "",
        county: "",
        city: "",
        street: "",
        paymentMethod: "cod",
    })

    const orderItems = useMemo(
        () => items.map((i) => ({ product: i.productId, qty: i.qty })),
        [items]
    )

    const startMpesaMutation = useMutation({
        mutationFn: async ({ orderId, phone }) => {
            const { data } = await api.post(`/payments/mpesa/stk/${orderId}`, { phone })
            return data
        },
    })

    const placeOrderMutation = useMutation({
        mutationFn: async () => {
            const payload = {
                orderItems,
                shippingAddress: {
                    phone: form.phone,
                    county: form.county,
                    city: form.city,
                    street: form.street,
                },
                paymentMethod: form.paymentMethod,
                itemsPrice: cartTotal,
                shippingPrice: 0,
                totalPrice: cartTotal,
            }

            const { data } = await api.post("/orders", payload)
            return data
        },
        onSuccess: async (order) => {
            // ✅ if mpesa -> initiate stk and wait for confirmation
            if (form.paymentMethod === "mpesa") {
                try {
                    setInfo("✅ Order created. Sending M-Pesa STK prompt…")

                    const phone254 = normalizeKenyaPhone(form.phone)
                    await startMpesaMutation.mutateAsync({ orderId: order._id, phone: phone254 })

                    setInfo("📲 STK prompt sent. Enter your PIN on your phone…")

                    // Clear cart now (order is created)
                    clearCart()

                    // Poll until paid
                    await pollOrderPaid(order._id, { intervalMs: 3000, maxTries: 20 })

                    setInfo("✅ Payment confirmed! Redirecting…")
                    navigate("/orders", { state: { newOrderId: order._id } })
                } catch (err) {
                    // keep order in orders page even if polling times out
                    clearCart()
                    setError(extractErrorMessage(err) || "Payment not confirmed yet. Check Orders page.")
                    navigate("/orders", { state: { newOrderId: order._id } })
                }
                return
            }

            // ✅ COD / Card (later)
            clearCart()
            navigate("/orders", { state: { newOrderId: order._id } })
        },
        onError: (err) => setError(extractErrorMessage(err)),
    })

    if (items.length === 0) {
        return (
            <div className="max-w-3xl mx-auto p-4">
                <Card>
                    <CardContent className="p-6">
                        <p>Your cart is empty.</p>
                        <Button className="mt-4" onClick={() => navigate("/")}>
                            Go shopping
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const onChange = (e) => {
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    }

    const onPlaceOrder = () => {
        setError(null)
        setInfo(null)

        if (!form.phone || !form.city || !form.street) {
            setError("Phone, city, and street are required")
            return
        }

        // extra strict validation for mpesa
        if (form.paymentMethod === "mpesa") {
            const phone254 = normalizeKenyaPhone(form.phone)
            if (!phone254.startsWith("254") || phone254.length < 12) {
                setError("For M-Pesa use phone like 0719xxxxxx (we convert) or 2547xxxxxxx")
                return
            }
        }

        placeOrderMutation.mutate()
    }

    const isBusy = placeOrderMutation.isPending || startMpesaMutation.isPending

    return (
        <div className="max-w-3xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Checkout</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Shipping & Payment</CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                    {error && (
                        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                            {error}
                        </div>
                    )}

                    {info && (
                        <div className="p-3 bg-emerald-500/10 text-emerald-700 text-sm rounded-md">
                            {info}
                        </div>
                    )}

                    <Input
                        name="phone"
                        placeholder="Phone (e.g. 0719...)"
                        value={form.phone}
                        onChange={onChange}
                        disabled={isBusy}
                    />
                    <Input
                        name="county"
                        placeholder="County (optional)"
                        value={form.county}
                        onChange={onChange}
                        disabled={isBusy}
                    />
                    <Input
                        name="city"
                        placeholder="City"
                        value={form.city}
                        onChange={onChange}
                        disabled={isBusy}
                    />
                    <Input
                        name="street"
                        placeholder="Street / Address"
                        value={form.street}
                        onChange={onChange}
                        disabled={isBusy}
                    />

                    <div className="space-y-2">
                        <div className="text-sm font-medium">Payment Method</div>
                        <select
                            name="paymentMethod"
                            value={form.paymentMethod}
                            onChange={onChange}
                            className="w-full border rounded-md p-2"
                            disabled={isBusy}
                        >
                            <option value="cod">Cash on Delivery</option>
                            <option value="mpesa">M-Pesa</option>
                            <option value="card" disabled>
                                Card (coming soon)
                            </option>
                        </select>

                        {form.paymentMethod === "mpesa" && (
                            <div className="text-xs text-muted-foreground">
                                You will receive an STK prompt to confirm payment after placing order.
                            </div>
                        )}
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                        <div className="font-semibold">Total: KES {cartTotal}</div>
                        <Button onClick={onPlaceOrder} disabled={isBusy}>
                            {isBusy
                                ? form.paymentMethod === "mpesa"
                                    ? "Processing M-Pesa..."
                                    : "Placing order..."
                                : "Place order"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
