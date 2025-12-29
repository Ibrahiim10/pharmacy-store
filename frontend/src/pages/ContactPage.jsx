import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin } from "lucide-react"
import { sendContactMessage } from "@/lib/api/contact.api"

export default function ContactPage() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
    })
    const [success, setSuccess] = useState(null)
    const [error, setError] = useState(null)

    const mutation = useMutation({
        mutationFn: sendContactMessage,
        onSuccess: (data) => {
            setError(null)
            setSuccess(data?.message || "Message sent successfully.")
            setForm({ name: "", email: "", phone: "", subject: "", message: "" })
        },
        onError: (err) => {
            setSuccess(null)
            setError(extractErrorMessage(err) || "Failed to send message")
        },
    })

    const onChange = (e) => {
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    }

    const submit = (e) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)

        if (!form.name || !form.email || !form.message) {
            setError("Name, email, and message are required")
            return
        }

        mutation.mutate({
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            subject: form.subject.trim(),
            message: form.message.trim(),
        })
    }

    return (
        <div className="max-w-6xl mx-auto p-4 grid gap-4 lg:grid-cols-[1fr_420px]">
            {/* Form */}
            <Card className="border-border">
                <CardHeader>
                    <CardTitle className="text-2xl">Contact Us</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Need help with an order, prescription upload, or product? Send a message and we’ll respond.
                    </p>

                    {error && (
                        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-3 bg-emerald-500/10 text-emerald-700 text-sm rounded-md">
                            {success}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Input name="name" value={form.name} onChange={onChange} placeholder="Full name" />
                            <Input name="email" value={form.email} onChange={onChange} placeholder="Email address" />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <Input name="phone" value={form.phone} onChange={onChange} placeholder="Phone (optional)" />
                            <Input name="subject" value={form.subject} onChange={onChange} placeholder="Subject (optional)" />
                        </div>

                        <Textarea
                            name="message"
                            value={form.message}
                            onChange={onChange}
                            placeholder="Write your message..."
                            rows={6}
                        />

                        <Button type="submit" className="w-full" disabled={mutation.isPending}>
                            {mutation.isPending ? "Sending..." : "Send Message"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Info */}
            <Card className="border-border h-fit">
                <CardHeader>
                    <CardTitle>Support Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                        <Mail className="w-4 h-4 mt-0.5" />
                        <div>
                            <div className="font-medium">Email</div>
                            <div className="text-muted-foreground">support@pharmacystore.com</div>
                        </div>
                    </div>

                    <div className="flex items-start gap-2">
                        <Phone className="w-4 h-4 mt-0.5" />
                        <div>
                            <div className="font-medium">Phone</div>
                            <div className="text-muted-foreground">+254 719 583 400</div>
                        </div>
                    </div>

                    <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5" />
                        <div>
                            <div className="font-medium">Location</div>
                            <div className="text-muted-foreground">Nairobi, Kenya</div>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-muted/30 p-3 text-muted-foreground">
                        <b>Tip:</b> For prescription medicines, include your order ID in the message for faster help.
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
