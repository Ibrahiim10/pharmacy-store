import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import useCartStore from "@/lib/store/cartStore"
import { useNavigate } from "react-router"

export default function CartPage() {
    const navigate = useNavigate()
    const items = useCartStore((s) => s.items)
    const removeItem = useCartStore((s) => s.removeItem)
    const updateQty = useCartStore((s) => s.updateQty)
    const total = useCartStore((s) => s.cartTotal())

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Cart</h1>

            {items.length === 0 ? (
                <Card>
                    <CardContent className="p-6">
                        <p>Your cart is empty.</p>
                        <Button className="mt-4" onClick={() => navigate("/")}>
                            Go shopping
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="space-y-3">
                        {items.map((i) => (
                            <Card key={i.productId}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">{i.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex items-center justify-between gap-3">
                                    <div className="text-sm">
                                        <div>KES {i.price}</div>
                                        <div className="text-muted-foreground">
                                            Stock: {i.countInStock}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            min={1}
                                            max={i.countInStock}
                                            value={i.qty}
                                            onChange={(e) => updateQty(i.productId, e.target.value)}
                                            className="w-20"
                                        />
                                        <Button
                                            variant="destructive"
                                            onClick={() => removeItem(i.productId)}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-lg font-semibold">Total: KES {total}</div>
                        <Button onClick={() => navigate("/checkout")}>
                            Proceed to checkout
                        </Button>
                    </div>
                </>
            )}
        </div>
    )
}
