import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Bot, BarChart3, ShoppingBag, Megaphone, ArrowRight, Zap, Shield, Globe, Package, Truck, CreditCard, Menu } from "lucide-react"
import { Hero } from "@/components/marketing/landing/sections/hero"
import { PricingCard } from "@/components/marketing/pricing-card"
import { FaqItem } from "@/components/marketing/faq-item"
import { Footer } from "@/components/marketing/landing/sections/footer"
import EcommerceCapabilities from "@/components/marketing/landing/sections/ecommerce-capabilities"
import PricingSection from "@/components/marketing/landing/sections/pricing-section"
import FaqSection from "@/components/marketing/landing/sections/fac-section"
import CtaSection from "@/components/marketing/landing/sections/cta-section"

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <main className="flex-1">
                <Hero />

                {/* Features Section - Bento Grid Style */}
                <section id="features" className="py-24 overflow-hidden bg-muted/30 relative">
                    {/* Background Gradient Blob */}
                    <div className="absolute inset-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10"></div>

                    <div className="container px-4 md:px-6 mx-auto">
                        <div className="text-center mb-16 max-w-3xl mx-auto">
                            <Badge variant="outline" className="mb-4 border-primary/20 text-primary bg-primary/5">Revenue Engine</Badge>
                            <h2 className="text-3xl font-bold tracking-tight md:text-5xl mb-6">
                                Turn Conversations into <span className="text-primary">Revenue</span>
                            </h2>
                            <p className="text-muted-foreground text-xl">
                                Stop leaving money on the table. Our AI agents work 24/7 to capture leads, recover carts, and close sales while you sleep.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Feature 1 - Large (Span 2) */}
                            <div className="md:col-span-2 group relative overflow-hidden rounded-3xl border bg-background/50 backdrop-blur-sm p-8 hover:border-primary/50 transition-colors duration-300">
                                <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
                                    <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                                        <Bot className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold mb-2">AI Sales Agent</h3>
                                        <p className="text-muted-foreground text-lg mb-4">
                                            Your best salesperson, available 24/7. It understands context, handles objections, and guides customers to purchase without human intervention.
                                        </p>
                                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Instant Responses</li>
                                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Multi-language Support</li>
                                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Catalog Integration</li>
                                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Smart Upselling</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Feature 2 - Tall (Span 1, Row 2) */}
                            <div className="md:row-span-2 group relative overflow-hidden rounded-3xl border bg-background/50 backdrop-blur-sm p-8 hover:border-primary/50 transition-colors duration-300 flex flex-col">
                                <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 w-fit mb-6">
                                    <Megaphone className="h-8 w-8" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Smart Campaigns</h3>
                                <p className="text-muted-foreground mb-6 flex-1">
                                    Don't just broadcast. Target. Segment your audience based on purchase history and behavior to send offers that actually convert.
                                </p>
                                <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium">Campaign ROI</span>
                                        <span className="text-green-500 font-bold">+312%</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 w-[75%]"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Feature 3 - Standard */}
                            <div className="group relative overflow-hidden rounded-3xl border bg-background/50 backdrop-blur-sm p-8 hover:border-primary/50 transition-colors duration-300">
                                <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500 w-fit mb-4">
                                    <ShoppingBag className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Auto-Detect Sales</h3>
                                <p className="text-muted-foreground">
                                    Automatically track orders from chat. No manual entry required. We sync directly with your inventory.
                                </p>
                            </div>

                            {/* Feature 4 - Standard */}
                            <div className="group relative overflow-hidden rounded-3xl border bg-background/50 backdrop-blur-sm p-8 hover:border-primary/50 transition-colors duration-300">
                                <div className="absolute inset-0 bg-linear-to-br from-orange-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500 w-fit mb-4">
                                    <BarChart3 className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Real-time Analytics</h3>
                                <p className="text-muted-foreground">
                                    Know your numbers. Track response times, conversion rates, and total revenue generated per agent.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <EcommerceCapabilities />

                {/* Social Proof / Stats */}
                <section className="py-20">
                    <div className="container px-4 md:px-6 mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-border">
                            <div className="p-4">
                                <div className="text-4xl font-bold text-primary mb-2">98%</div>
                                <div className="text-muted-foreground">Open Rate</div>
                            </div>
                            <div className="p-4">
                                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                                <div className="text-muted-foreground">Automated Support</div>
                            </div>
                            <div className="p-4">
                                <div className="text-4xl font-bold text-primary mb-2">3x</div>
                                <div className="text-muted-foreground">ROI Increase</div>
                            </div>
                        </div>
                    </div>
                </section>

                <PricingSection />

                <FaqSection />

                <CtaSection />
            </main>

        </div >
    )
}



