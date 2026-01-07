// ✅ Pro Footer (paste near the bottom of HomePage or in a shared Layout component)
import {
    Facebook,
    Instagram,
    Twitter,
    Mail,
    Phone,
    MapPin,
} from "lucide-react"

function Footer() {
    const year = new Date().getFullYear()

    return (
        <footer className="border-t bg-green-500/10">
            <div className="max-w-6xl mx-auto px-4 py-12">
                {/* Top */}
                <div className="grid gap-10 md:grid-cols-4">
                    {/* Brand */}
                    <div className="space-y-3 md:col-span-1">
                        <div className="flex items-center gap-2">
                            <div className="h-9 w-9 rounded-xl bg-emerald-600/10 border flex items-center justify-center">
                                <span className="text-emerald-700 font-bold">Rx</span>
                            </div>
                            <div className="font-semibold text-lg">PharmaStore</div>
                        </div>

                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Order medicines and healthcare essentials online with fast delivery,
                            secure payments, and pharmacist support.
                        </p>

                        <div className="flex items-center gap-2 pt-2">
                            <a
                                href="#"
                                aria-label="Facebook"
                                className="h-9 w-9 rounded-full border bg-background hover:bg-muted transition flex items-center justify-center"
                            >
                                <Facebook className="h-4 w-4" />
                            </a>
                            <a
                                href="#"
                                aria-label="Instagram"
                                className="h-9 w-9 rounded-full border bg-background hover:bg-muted transition flex items-center justify-center"
                            >
                                <Instagram className="h-4 w-4" />
                            </a>
                            <a
                                href="#"
                                aria-label="Twitter"
                                className="h-9 w-9 rounded-full border bg-background hover:bg-muted transition flex items-center justify-center"
                            >
                                <Twitter className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    {/* Shop */}
                    <div className="space-y-3">
                        <div className="font-semibold">Shop</div>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a className="hover:text-foreground transition" href="/products">All Products</a></li>
                            <li><a className="hover:text-foreground transition" href="/products?category=pain%20relief">Pain Relief</a></li>
                            <li><a className="hover:text-foreground transition" href="/products?category=vitamins">Vitamins</a></li>
                            <li><a className="hover:text-foreground transition" href="/orders">Upload Prescription</a></li>
                        </ul>
                    </div>

                    {/* Help */}
                    <div className="space-y-3">
                        <div className="font-semibold">Support</div>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><a className="hover:text-foreground transition" href="/faq">FAQ</a></li>
                            <li><a className="hover:text-foreground transition" href="/shipping">Delivery & Returns</a></li>
                            <li><a className="hover:text-foreground transition" href="/privacy">Privacy Policy</a></li>
                            <li><a className="hover:text-foreground transition" href="/terms">Terms of Service</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-3">
                        <div className="font-semibold">Contact</div>

                        <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <a className="hover:text-foreground transition" href="tel:+254700000000">
                                    +254 700 000 000
                                </a>
                            </div>

                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <a
                                    className="hover:text-foreground transition"
                                    href="mailto:support@pharmastore.com"
                                >
                                    support@pharmastore.com
                                </a>
                            </div>

                            <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 mt-0.5" />
                                <div>
                                    Nairobi, Kenya
                                    <div className="text-xs text-muted-foreground">
                                        Mon–Sun • 8:00 AM – 10:00 PM
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payments */}
                        <div className="pt-3">
                            <div className="text-xs text-muted-foreground mb-2">We accept</div>
                            <div className="flex flex-wrap gap-2">
                                <span className="text-xs px-2 py-1 rounded-full border bg-muted/40">M-Pesa</span>
                                <span className="text-xs px-2 py-1 rounded-full border bg-muted/40">Card</span>
                                <span className="text-xs px-2 py-1 rounded-full border bg-muted/40">Cash on Delivery</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground">
                        © {year} PharmaStore. All rights reserved.
                    </p>

                    <p className="text-xs text-muted-foreground">
                        Disclaimer: Information provided is not medical advice. Consult a pharmacist/doctor.
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
