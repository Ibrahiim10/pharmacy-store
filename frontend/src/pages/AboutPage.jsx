import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    ShieldCheck,
    Truck,
    Stethoscope,
    Clock,
    CheckCircle2,
    HeartPulse,
    Users,
} from "lucide-react"
import { useNavigate } from "react-router"
import Footer from "./footer"

function Feature({ icon, title, desc }) {
    return (
        <Card className="group overflow-hidden rounded-2xl border bg-background transition hover:shadow-md">
            <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-muted flex items-center justify-center">
                        {icon}
                    </div>
                    <div className="font-semibold">{title}</div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </CardContent>
        </Card>
    )
}

function ValueRow({ icon, title, desc }) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 h-9 w-9 rounded-xl bg-muted flex items-center justify-center">
                {icon}
            </div>
            <div>
                <div className="font-semibold">{title}</div>
                <div className="text-sm text-muted-foreground leading-relaxed">{desc}</div>
            </div>
        </div>
    )
}

export default function AboutPage() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-muted/20">
            {/* HERO */}
            <section className="relative overflow-hidden border-b bg-gradient-to-b from-background to-muted/30">
                <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
                    <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-orange-500/50 blur-3xl" />
                    <div className="pointer-events-none absolute -left-24 -bottom-24 h-56 w-56 rounded-full bg-sky-500/50 blur-3xl" />
                    <div className="grid gap-10 md:grid-cols-2 md:items-center">
                        {/* Left */}
                        <div className="space-y-5">
                            <div className="inline-flex items-center gap-2 rounded-full border bg-background/10 px-3 py-1 text-xs text-muted-foreground">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                Trusted Online Pharmacy • Fast Delivery • Secure Payments
                            </div>

                            <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
                                About Pharmacy Store
                            </h1>

                            <p className="text-muted-foreground md:text-lg leading-relaxed max-w-xl">
                                We make ordering medicines simple, safe, and fast. From verified products to
                                pharmacist review for prescriptions — we help you get what you need with clear
                                updates from checkout to delivery.
                            </p>

                            <div className="flex flex-wrap gap-3 pt-2">
                                <Button onClick={() => navigate("/")} className="gap-2">
                                    Shop Now
                                    <span className="translate-y-[1px]">→</span>
                                </Button>
                                <Button variant="outline" onClick={() => navigate("/contact")}>
                                    Contact Us
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-2">
                                <span className="text-xs px-3 py-1 rounded-full border bg-background">
                                    M-Pesa supported
                                </span>
                                <span className="text-xs px-3 py-1 rounded-full border bg-background">
                                    Pharmacist review
                                </span>
                                <span className="text-xs px-3 py-1 rounded-full border bg-background">
                                    Order tracking
                                </span>
                            </div>
                        </div>

                        {/* Right: Trust / Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="rounded-2xl border bg-background/10 backdrop-blur">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                        <HeartPulse className="h-4 w-4 text-red-600" />
                                        Care-first experience
                                    </div>
                                    <div className="mt-2 text-2xl font-bold">Reliable</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        Verified products & clear info
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-2xl border bg-background/10 backdrop-blur">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                        <Truck className="h-4 w-4 text-sky-600" />
                                        Fast delivery
                                    </div>
                                    <div className="mt-2 text-2xl font-bold">Quick</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        Updates from dispatch to delivery
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-2xl border bg-background/10 backdrop-blur">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                        <ShieldCheck className="h-4 w-4 text-violet-600" />
                                        Secure payments
                                    </div>
                                    <div className="mt-2 text-2xl font-bold">Safe</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        Trusted checkout & privacy
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-2xl border bg-background/10 backdrop-blur">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                        <Users className="h-4 w-4 text-orange-600" />
                                        Support
                                    </div>
                                    <div className="mt-2 text-2xl font-bold">24/7</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        Always here to help
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section className="max-w-6xl mx-auto px-4 py-10">
                <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                        Why customers choose us
                    </h2>
                    <p className="text-sm md:text-base text-muted-foreground mt-2">
                        Built for trust, speed, and a smooth experience — from browsing to delivery.
                    </p>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Feature
                        icon={<ShieldCheck className="h-5 w-5 text-violet-600 " />}
                        title="Trusted products"
                        desc="Verified medicines with clear product details and quality checks."
                    />
                    <Feature
                        icon={<Stethoscope className="h-5 w-5 text-emerald-600" />}
                        title="Prescription support"
                        desc="Upload prescriptions for regulated medicines and get pharmacist review."
                    />
                    <Feature
                        icon={<Truck className="h-5 w-5 text-sky-600" />}
                        title="Fast delivery"
                        desc="Order updates from approval to dispatch and delivery — clear and simple."
                    />
                    <Feature
                        icon={<Clock className="h-5 w-5 text-emerald-600" />}
                        title="Convenient shopping"
                        desc="Search, add to cart, and checkout in minutes — optimized for mobile too."
                    />
                </div>
            </section>

            {/* MISSION + VALUES */}
            <section className="max-w-6xl mx-auto px-4 pb-12">
                <div className="grid gap-4 md:grid-cols-2 ">

                    <Card className="rounded-2xl border 
                    bg-background ">
                        <CardHeader>
                            <CardTitle className="text-xl">Our Mission</CardTitle>
                        </CardHeader>
                        <CardContent className="text-muted-foreground leading-relaxed ">

                            To improve access to healthcare by making medicine ordering reliable, transparent, and
                            customer-friendly — while supporting safety through pharmacist review when required.
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl border bg-background">
                        <CardHeader>
                            <CardTitle className="text-xl">What we stand for</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ValueRow
                                icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                                title="Accuracy & transparency"
                                desc="Clear product info, pricing, and order updates — no confusion."
                            />
                            <ValueRow
                                icon={<ShieldCheck className="h-5 w-5 text-violet-600" />}
                                title="Safety first"
                                desc="Prescription checks and guidance where needed to protect customers."
                            />
                            <ValueRow
                                icon={<Truck className="h-5 w-5 text-sky-600" />}
                                title="Speed with care"
                                desc="Efficient delivery while keeping service quality high."
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom CTA */}
                <div className="mt-8 rounded-2xl border bg-background p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="text-lg font-semibold">Need help with an order or prescription?</div>
                        <div className="text-sm text-muted-foreground">
                            Contact our support team and we’ll assist you quickly.
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" onClick={() => navigate("/contact")}>
                            Contact Support
                        </Button>
                        <Button onClick={() => navigate("/")}>Start Shopping</Button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
