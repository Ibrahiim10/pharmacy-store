import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLocation, useNavigate } from "react-router"
import api from "@/lib/api/apiClient"

export default function OrdersPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const newOrderId = location.state?.newOrderId

    const { data: orders = [], isLoading, isError } = useQuery({
        queryKey: ["myOrders"],
        queryFn: async () => {
            const { data } = await api.get("/orders/my")
            return data
        },
        refetchOnWindowFocus: false,
    })

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">My Orders</h1>

            {newOrderId && (
                <div className="mb-4 p-3 rounded-md bg-secondary text-sm">
                    ✅ Order placed successfully! Order ID: <b>{newOrderId}</b>
                </div>
            )}

            {isLoading && <p>Loading...</p>}
            {isError && <p className="text-destructive">Failed to load orders.</p>}

            <div className="space-y-3 mt-4">
                {orders.map((o) => (
                    <Card key={o._id}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">
                                Order #{o._id.slice(-6)} • {o.status}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="text-sm">Total: KES {o.totalPrice}</div>
                            <div className="text-sm text-muted-foreground">
                                Items: {o.orderItems?.length}
                            </div>

                            {o.requiresPrescription && !o.prescription?.url && (
                                <Button
                                    onClick={() =>
                                        navigate(`/upload-prescription/${o._id}`)
                                    }
                                >
                                    Upload Prescription
                                </Button>
                            )}

                            {o.prescription?.url && (
                                <Button
                                    variant="outline"
                                    onClick={() => window.open(o.prescription.url, "_blank")}
                                >
                                    View Prescription
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
