import { useMemo, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router"

import heroImage from "@/assets/images/hro.png"
import rxImage from "@/assets/images/hero.png"
import RxImage from "@/assets/images/accurate.jpeg"

import {
    Truck,
    Headphones,
    ShieldCheck,
    ShoppingCart,
    Upload,
    Search,
    Stethoscope,
    Clock,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { fetchProducts } from "@/lib/api/products"
import useCartStore from "@/lib/store/cartStore"
import { toast } from "sonner"
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

export default function HomePage() {
    const navigate = useNavigate()
    const productsRef = useRef(null)

    // server search
    const [q, setQ] = useState("")
    // UI category filter
    const [activeTab, setActiveTab] = useState("All")

    const addItem = useCartStore((s) => s.addItem)

    const { data: products = [], isLoading, isError } = useQuery({
        queryKey: ["products", q],
        queryFn: () => fetchProducts(q ? { q } : {}),
        select: (res) => {
            if (Array.isArray(res)) return res
            if (Array.isArray(res?.products)) return res.products
            if (Array.isArray(res?.data)) return res.data
            if (Array.isArray(res?.items)) return res.items
            return []
        },
        refetchOnWindowFocus: false,
        staleTime: 30_000,
    })

    const tabs = useMemo(
        () => ["All", "Pain Relief", "Vitamins", "Diabetes Care", "Blood Pressure"],
        []
    )

    const filteredProducts = useMemo(() => {
        const list = Array.isArray(products) ? products : []
        if (activeTab === "All") return list

        const tab = activeTab.toLowerCase()
        return list.filter((p) =>
            String(p?.category || "").toLowerCase().includes(tab)
        )
    }, [products, activeTab])

    const featuredProducts = useMemo(() => {
        const list = Array.isArray(filteredProducts) ? filteredProducts : []
        return list.slice(0, 4)
    }, [filteredProducts])

    const handleShopNow = () => {
        productsRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    const handleAddToCart = (p) => {
        const productId = p?._id || p?.id
        if (!productId) {
            toast.error("Unable to add to cart", {
                description: "Product id is missing.",
            })
            return
        }

        addItem({
            productId,
            name: p?.name,
            price: p?.price,
            countInStock: p?.countInStock,
            image: p?.image, // helpful for cart UI
        })

        toast.success("Added to cart", {
            description: `${p?.name ?? "Item"} has been added to your cart.`,
        })
    }

    return (
        <div className="w-full">
            {/* HERO */}
            <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-center overflow-hidden">
                <img
                    src={heroImage}
                    alt="Delivery & Pharmacy Products"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/55 to-black/30" />
                <div className="relative z-10 max-w-6xl mx-auto px-4 py-16">
                    <div className="grid gap-8 md:grid-cols-2 md:items-center">
                        {/* Left */}
                        <div className="space-y-4">
                            <h1 className="text-white text-3xl md:text-5xl font-bold leading-tight">
                                Your Health, Delivered <br className="hidden md:block" />
                                to Your Doorstep
                            </h1>
                            <p className="text-gray-50 md:text-lg">
                                Order medicines & healthcare products online. Fast delivery,
                                secure checkout, and pharmacist support.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 pt-8">
                                <Button className="gap-2" onClick={handleShopNow}>
                                    <ShoppingCart className="w-4 h-4" />
                                    Shop Now
                                </Button>

                                {/* FIXED: one click target only */}
                                <Button
                                    variant="secondary"
                                    className="gap-2"
                                    onClick={() => navigate("/upload-prescription")}
                                >
                                    <Upload className="w-4 h-4" />
                                    Upload Prescription
                                </Button>
                            </div>
                        </div>

                        {/* Right image */}
                        <div className="relative">
                            <div className="aspect-[16/10] rounded-xl border bg-muted overflow-hidden shadow-md flex items-center justify-center">
                                <img
                                    src={rxImage}
                                    alt="Delivery & Pharmacy Products"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature strip */}
            <section className="relative -mt-10 z-20">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid gap-4 md:grid-cols-3 rounded-2xl border bg-background/70 backdrop-blur-lg shadow-sm p-5">
                        <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                                <Truck className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="font-semibold leading-tight">Fast Delivery</div>
                                <div className="text-sm text-muted-foreground">
                                    Get medicines quickly
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-500/10 text-sky-600">
                                <Headphones className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="font-semibold leading-tight">24/7 Support</div>
                                <div className="text-sm text-muted-foreground">
                                    Always here to help
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-500/10 text-violet-600">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="font-semibold leading-tight">Secure Payment</div>
                                <div className="text-sm text-muted-foreground">
                                    Safe & reliable checkout
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURED PRODUCTS */}
            <section ref={productsRef} className="max-w-6xl mx-auto px-4 py-10">
                <div className="m-12 text-center">
                    <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
                </div>

                {/* Loading / Error */}
                <div className="mt-2">
                    {isLoading && <p>Loading products...</p>}
                    {isError && (
                        <p className="text-destructive">Failed to load products.</p>
                    )}
                </div>

                {!isLoading && !isError && (
                    <div className="grid gap-6 mt-4 sm:grid-cols-2 lg:grid-cols-4">
                        {featuredProducts.map((p) => {
                            const outOfStock = Number(p?.countInStock ?? 0) <= 0
                            const key = p?._id || p?.id || `${p?.name}-${p?.price}`

                            return (
                                <Card
                                    key={key}
                                    className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition"
                                >
                                    {/* Image */}
                                    <div className="flex h-44 items-center justify-center bg-white p-4">
                                        {p?.image ? (
                                            <img
                                                src={p.image}
                                                alt={p.name}
                                                className="h-full w-full object-contain"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <span className="text-xs text-muted-foreground">
                                                No image
                                            </span>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="px-5 pb-5 pt-2 space-y-3">
                                        <div className="space-y-1">
                                            <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                                {p?.name}
                                            </div>

                                            <div className="text-base font-bold text-gray-900">
                                                KES {p?.price}
                                            </div>
                                        </div>

                                        <Button
                                            className="w-full rounded-md bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400"
                                            disabled={outOfStock}
                                            onClick={() => handleAddToCart(p)}
                                        >
                                            {outOfStock ? "Out of stock" : "Add to Cart"}
                                        </Button>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                )}

                {!isLoading && !isError && featuredProducts.length === 0 && (
                    <p className="text-muted-foreground mt-4">No featured products.</p>
                )}
            </section>

            {/* SEARCH + TABS */}
            <section className="max-w-6xl mx-auto px-4 pb-10">
                <div className="flex items-center gap-2 rounded-xl border bg-background p-3">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search medicines..."
                        className="border-0 shadow-none focus-visible:ring-0"
                        aria-label="Search medicines"
                    />
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                    {tabs.map((tab) => (
                        <Button
                            key={tab}
                            variant={activeTab === tab ? "default" : "outline"}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </Button>
                    ))}
                </div>

                {/* Product grid */}
                <div className="mt-8">
                    {!isLoading && !isError && filteredProducts.length === 0 && (
                        <div className="rounded-2xl border bg-background p-10 text-center">
                            <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-muted" />
                            <p className="font-semibold">No products found</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Try a different keyword or switch a category tab.
                            </p>
                        </div>
                    )}

                    {!isLoading && !isError && filteredProducts.length > 0 && (
                        <div className="grid gap-6 mt-4 sm:grid-cols-2 lg:grid-cols-4">
                            {filteredProducts.map((p) => {
                                const outOfStock = Number(p?.countInStock ?? 0) <= 0
                                const key = p?._id || p?.id || `${p?.name}-${p?.price}`

                                return (
                                    <Card
                                        key={key}
                                        className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition"
                                    >
                                        {/* FIXED: relative parent for absolute badges/overlay */}
                                        <div className="relative flex h-44 items-center justify-center bg-white p-4 overflow-hidden">
                                            {p?.image ? (
                                                <img
                                                    src={p.image}
                                                    alt={p.name}
                                                    className="h-full w-full object-contain"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <span className="text-xs text-muted-foreground">
                                                        No image
                                                    </span>
                                                </div>
                                            )}

                                            {/* Badges */}
                                            <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                                                {p?.prescriptionRequired && (
                                                    <span className="rounded-full border bg-background/85 px-2.5 py-1 text-[11px] backdrop-blur">
                                                        Prescription
                                                    </span>
                                                )}
                                                {outOfStock && (
                                                    <span className="rounded-full border border-destructive/20 bg-destructive/10 px-2.5 py-1 text-[11px] text-destructive">
                                                        Out of stock
                                                    </span>
                                                )}
                                            </div>

                                            {/* Subtle bottom fade */}
                                            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/60 to-transparent" />
                                        </div>

                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg leading-tight line-clamp-1">
                                                {p?.name}
                                            </CardTitle>
                                            <CardDescription className="line-clamp-1">
                                                {p?.category || "General"}
                                            </CardDescription>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="text-base font-semibold">
                                                    KES {p?.price}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    Stock:{" "}
                                                    <span className="font-medium">
                                                        {Number(p?.countInStock ?? 0)}
                                                    </span>
                                                </div>
                                            </div>

                                            <Button
                                                className="w-full"
                                                disabled={outOfStock}
                                                onClick={() => handleAddToCart(p)}
                                            >
                                                {outOfStock ? "Out of stock" : "Add to Cart"}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* PROMO SECTION (unchanged from your original) */}
            <section className="max-w-6xl mx-auto px-4 pb-16">
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Card 1: Deals */}
                    <Card className="group overflow-hidden rounded-2xl border bg-background hover:shadow-md transition">
                        <CardContent className="relative p-6 md:p-7">
                            <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
                            <div className="pointer-events-none absolute -left-24 -bottom-24 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl" />

                            <div className="flex items-center justify-between gap-6">
                                <div className="space-y-3">
                                    <div className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                        Special Offers
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="text-xl md:text-2xl font-bold tracking-tight">
                                            Up to <span className="text-emerald-600">30% Off</span>
                                        </h3>
                                        <p className="text-sm md:text-base text-muted-foreground">
                                            Save on health & wellness essentials this week.
                                        </p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3 pt-1">
                                        <Button
                                            variant="secondary"
                                            onClick={handleShopNow}
                                            className="gap-2"
                                        >
                                            Shop Deals
                                            <span className="transition-transform group-hover:translate-x-0.5">
                                                →
                                            </span>
                                        </Button>

                                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                                            Limited time
                                        </div>
                                    </div>
                                </div>

                                <div className="hidden sm:block">
                                    <div className="relative h-28 w-28 rounded-2xl border bg-muted overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-sky-500/10" />
                                        <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                                            <div className="h-28 w-28 sm:h-32 sm:w-32 md:h-36 md:w-36 rounded-2xl overflow-hidden border bg-muted shrink-0">
                                                <img
                                                    src={RxImage}
                                                    alt="Prescription upload"
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 2: Prescription */}
                    <Card className="group overflow-hidden rounded-2xl border bg-background hover:shadow-md transition">
                        <CardContent className="relative p-6 md:p-7">
                            <div className="pointer-events-none absolute -right-24 -bottom-24 h-56 w-56 rounded-full bg-orange-500/10 blur-3xl" />
                            <div className="pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full bg-orange-500/10 blur-3xl" />

                            <div className="flex items-center justify-between gap-6">
                                <div className="space-y-3">
                                    <div className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
                                        <span className="h-2 w-2 rounded-full bg-violet-500" />
                                        Upload Prescription
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="text-xl md:text-2xl font-bold tracking-tight">
                                            Get Medicines With Ease
                                        </h3>
                                        <p className="text-sm md:text-base text-muted-foreground">
                                            Upload your prescription — pharmacist reviews, then you
                                            checkout.
                                        </p>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3 pt-1">
                                        {/* If your route is /upload-prescription, use it here too */}
                                        <Button
                                            onClick={() => navigate("/upload-prescription")}
                                            className="gap-2"
                                        >
                                            Upload Now
                                            <span className="transition-transform group-hover:translate-x-0.5">
                                                →
                                            </span>
                                        </Button>

                                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                                            Fast review
                                        </div>
                                    </div>
                                </div>

                                <div className="h-28 w-28 sm:h-32 sm:w-32 md:h-36 md:w-36 rounded-2xl overflow-hidden border bg-muted shrink-0">
                                    <img
                                        src={rxImage}
                                        alt="Prescription upload"
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* WhatsApp + M-Pesa CTA (unchanged) */}
            <section className="relative overflow-hidden">
                <div className="relative max-w-7xl mx-auto px-4 py-14 md:py-20">
                    <Card className="group overflow-hidden rounded-2xl border bg-background hover:shadow-md transition">
                        <CardContent className="relative p-6 md:p-7">
                            <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-orange-500/10 blur-3xl" />
                            <div className="pointer-events-none absolute -left-24 -bottom-24 h-56 w-56 rounded-full bg-sky-500/10 blur-3xl" />

                            <div className="grid gap-10 md:grid-cols-2 md:items-center">
                                <div className="text-black space-y-4">
                                    <span className="inline-block text-sm text-green-700 font-medium uppercase tracking-wide bg-green-100 px-3 py-1 rounded-full">
                                        ⚡️ Fast & Secure Payments
                                    </span>

                                    <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                                        Order Easily via WhatsApp
                                        <br className="hidden md:block" />
                                        Pay Securely with M-Pesa
                                    </h2>

                                    <p className="max-w-xl">
                                        Chat with us on WhatsApp to place your order, upload
                                        prescriptions, and complete payment instantly using M-Pesa.
                                    </p>

                                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                        <a
                                            href="https://wa.me/254719583400?text=Hello%20I%20would%20like%20to%20order%20medicines"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center gap-2 rounded-md bg-green-200 text-emerald-700 px-6 py-3 text-sm font-medium hover:bg-white/90 transition"
                                        >
                                            💬 Order via WhatsApp
                                        </a>

                                        <Button
                                            size="lg"
                                            variant="secondary"
                                            className="bg-green-200 text-gray-700 hover:bg-white/20"
                                            onClick={() => navigate("/checkout")}
                                        >
                                            📲 Pay with M-Pesa
                                        </Button>
                                    </div>

                                    <div className="flex flex-wrap gap-6 pt-6 text-sm text-gray-700">
                                        <div className="flex items-center gap-2">🔒 Secure Payments</div>
                                        <div className="flex items-center gap-2">🚚 Fast Delivery</div>
                                        <div className="flex items-center gap-2">👨‍⚕️ Pharmacist Support</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-2xl bg-green-50 backdrop-blur-md border border-green-200 p-6 text-black">
                                        <div className="text-3xl font-bold">WhatsApp</div>
                                        <div className="text-sm text-gray-700">Instant chat order</div>
                                    </div>

                                    <div className="rounded-2xl bg-green-50 backdrop-blur-md border border-green-200 p-6 text-green-500">
                                        <div className="text-3xl font-bold">M-Pesa</div>
                                        <div className="text-sm text-gray-700">Secure payment</div>
                                    </div>

                                    <div className="rounded-2xl bg-green-50 backdrop-blur-md border border-green-200 p-6 text-black">
                                        <div className="text-3xl font-bold">24/7</div>
                                        <div className="text-sm text-gray-700">Support</div>
                                    </div>

                                    <div className="rounded-2xl bg-green-50 backdrop-blur-md border border-green-200 p-6 text-black">
                                        <div className="text-3xl font-bold">Fast</div>
                                        <div className="text-sm text-gray-700">Delivery</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* FEATURES */}
            <section className="max-w-6xl mx-auto px-4 py-10">
                <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                        Why customers choose us
                    </h2>
                    <p className="text-sm md:text-base text-muted-foreground mt-2">
                        Built for trust, speed, and a smooth experience — from browsing to
                        delivery.
                    </p>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Feature
                        icon={<ShieldCheck className="h-5 w-5 text-violet-600" />}
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

            <Footer />
        </div>
    )
}
