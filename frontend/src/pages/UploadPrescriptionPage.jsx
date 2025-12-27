import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useNavigate, useParams } from "react-router"
import api from "@/lib/api/apiClient"

export default function UploadPrescriptionPage() {
    const { orderId } = useParams()
    const navigate = useNavigate()

    const [file, setFile] = useState(null)
    const [error, setError] = useState(null)

    const uploadMutation = useMutation({
        mutationFn: async () => {
            const form = new FormData()
            form.append("file", file)

            const { data } = await api.post(`/uploads/prescription/${orderId}`, form)
            return data
        },
        onSuccess: () => {
            navigate("/orders")
        },
        onError: (err) => setError(extractErrorMessage(err)),
    })

    return (
        <div className="max-w-xl mx-auto p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Upload Prescription</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {error && (
                        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                            {error}
                        </div>
                    )}

                    <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />

                    <Button
                        disabled={!file || uploadMutation.isPending}
                        onClick={() => {
                            setError(null)
                            uploadMutation.mutate()
                        }}
                    >
                        {uploadMutation.isPending ? "Uploading..." : "Upload"}
                    </Button>

                    <Button variant="outline" onClick={() => navigate("/orders")}>
                        Back
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
