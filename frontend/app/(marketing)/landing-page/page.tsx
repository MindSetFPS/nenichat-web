import Link from "next/link"
import { Button } from "@/components/ui/button"
import { WaitlistForm } from "@/components/landing/waitlist-form"
import { HeroChatAnimation } from "@/components/landing/hero-chat-animation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Bot, BarChart3, ShoppingBag, Megaphone, ArrowRight, Zap, Shield, Globe, Package, Truck, CreditCard } from "lucide-react"

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            {/* Navigation */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                <div className="container flex h-16 items-center justify-between px-4 md:px-6 mx-auto">
                    <div className="flex items-center gap-2 font-bold text-xl">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                            <Bot className="h-5 w-5" />
                        </div>
                        <span>Nenichat</span>
                    </div>
                    <nav className="hidden md:flex gap-6 text-sm font-medium">
                        <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
                        <Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link>
                        <Link href="#about" className="hover:text-primary transition-colors">About</Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <Button variant="ghost" size="sm">Log in</Button>
                        </Link>
                        <Link href="/signup">
                            <Button size="sm">Get Started</Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative py-20 md:py-32 overflow-hidden">
                    <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[14px_24px]"></div>
                    <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>

                    <div className="container px-4 md:px-6 mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            {/* Left Column: Text Content */}
                            <div className="text-center lg:text-left">
                                <Badge className="mb-4" variant="secondary">New: AI-Powered Campaigns</Badge>
                                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight lg:text-7xl mb-6 bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
                                    Automate Your Chat. <br className="hidden md:block" />
                                    <span className="text-primary">Boost Your Sales.</span>
                                </h1>
                                <p className="mx-auto lg:mx-0 max-w-[700px] text-muted-foreground md:text-xl mb-8">
                                    The all-in-one platform to automate customer interactions, track sales, and launch high-converting marketing campaigns on WhatsApp.
                                </p>
                                <div className="w-full max-w-md space-y-2 mx-auto lg:mx-0">
                                    <WaitlistForm />
                                    <p className="text-xs text-muted-foreground text-center lg:text-left pl-1">
                                        Get early access and exclusive launch pricing.
                                    </p>
                                </div>
                                <div className="mt-12 text-sm text-muted-foreground">
                                    <p>Trusted by forward-thinking companies</p>
                                    <div className="flex flex-wrap justify-center lg:justify-start gap-8 mt-4 opacity-70 grayscale">
                                        {/* Placeholders for logos */}
                                        <div className="flex items-center gap-2 font-semibold"><Globe className="h-4 w-4" /> Acme Corp</div>
                                        <div className="flex items-center gap-2 font-semibold"><Zap className="h-4 w-4" /> BoltShift</div>
                                        <div className="flex items-center gap-2 font-semibold"><Shield className="h-4 w-4" /> SecureNet</div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Chat Animation */}
                            <HeroChatAnimation />
                        </div>
                    </div>
                </section>

                {/* Features Section - Bento Grid Style */}
                <section id="features" className="py-24 bg-muted/30 relative">
                    {/* Background Gradient Blob */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10"></div>

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

                {/* E-commerce Capabilities Section */}
                <section className="py-24 bg-background relative overflow-hidden">
                    <div className="container px-4 md:px-6 mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <Badge variant="outline" className="mb-4 border-blue-500/20 text-blue-500 bg-blue-500/5">End-to-End Commerce</Badge>
                                <h2 className="text-3xl font-bold tracking-tight md:text-5xl mb-6">
                                    A Full E-commerce Store. <br />
                                    <span className="text-blue-500">Inside WhatsApp.</span>
                                </h2>
                                <p className="text-muted-foreground text-xl mb-8">
                                    Forget clunky external links. Give your customers a seamless, native shopping experience with everything they expect from a professional store.
                                </p>

                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                            <Package className="h-6 w-6 text-blue-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold mb-1">Live Inventory Sync</h3>
                                            <p className="text-muted-foreground">
                                                Real-time unit tracking. When a product sells, stock updates instantly across all active chats. Never oversell again.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                            <Truck className="h-6 w-6 text-blue-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold mb-1">Automated Logistics</h3>
                                            <p className="text-muted-foreground">
                                                From order confirmation to delivery at their doorstep. Send automated tracking updates and shipping notifications directly in the chat.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                            <CreditCard className="h-6 w-6 text-blue-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold mb-1">Native Checkout</h3>
                                            <p className="text-muted-foreground">
                                                A frictionless purchasing journey. Customers can browse catalogs, add to cart, and pay without ever leaving the app.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="relative">
                                {/* Abstract representation of the e-commerce engine */}
                                <div className="absolute inset-0 bg-linear-to-tr from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl -z-10"></div>
                                <div className="bg-background border rounded-3xl shadow-2xl p-8 relative overflow-hidden">
                                    <div className="flex items-center justify-between mb-8 border-b pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                                <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div>
                                                <div className="font-bold">Order #2481 Confirmed</div>
                                                <div className="text-xs text-muted-foreground">Just now</div>
                                            </div>
                                        </div>
                                        <Badge className="bg-green-500 hover:bg-green-600">Paid</Badge>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex gap-4 items-center p-3 bg-muted/50 rounded-xl">
                                            <div className="h-12 w-12 bg-white rounded-lg border flex items-center justify-center">
                                                <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium">Premium Cotton T-Shirt</div>
                                                <div className="text-sm text-muted-foreground">Size: L • Color: Black</div>
                                            </div>
                                            <div className="font-bold">$29.00</div>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span>$29.00</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Shipping (Express)</span>
                                            <span>$5.00</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                            <span>Total</span>
                                            <span>$34.00</span>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Truck className="h-4 w-4 text-blue-500" />
                                            <span className="font-semibold text-blue-700 dark:text-blue-300">Shipping Update</span>
                                        </div>
                                        <p className="text-sm text-blue-600 dark:text-blue-400">
                                            Your order has been shipped! Track your package: <span className="underline cursor-pointer">TRK-8842-XJ</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

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

                {/* Pricing Section */}
                <section id="pricing" className="py-20 bg-muted/50">
                    <div className="container px-4 md:px-6 mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">Simple, transparent pricing</h2>
                            <p className="text-muted-foreground text-lg">
                                Choose the plan that fits your business needs. No hidden fees.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            <PricingCard
                                title="Starter"
                                price="$29"
                                description="Perfect for small businesses just getting started."
                                features={["1,000 Messages/mo", "Basic Automation", "7-day Analytics History", "Email Support"]}
                            />
                            <PricingCard
                                title="Pro"
                                price="$79"
                                description="For growing teams that need more power."
                                features={["10,000 Messages/mo", "Advanced Workflows", "Unlimited Analytics", "Priority Support", "Campaign Management"]}
                                popular
                            />
                            <PricingCard
                                title="Enterprise"
                                price="Custom"
                                description="Tailored solutions for large organizations."
                                features={["Unlimited Messages", "Custom Integrations", "Dedicated Success Manager", "SLA Support", "On-premise Deployment"]}
                            />
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section id="faq" className="py-24 bg-background">
                    <div className="container px-4 md:px-6 mx-auto max-w-3xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">Frequently Asked Questions</h2>
                            <p className="text-muted-foreground text-lg">
                                Everything you need to know about Nenichat.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <FaqItem
                                question="Do I need the WhatsApp Business API?"
                                answer="Yes, Nenichat connects directly to the official WhatsApp Business API to ensure reliability and compliance. We help you through the verification process."
                            />
                            <FaqItem
                                question="Can I use my existing WhatsApp number?"
                                answer="Absolutely. You can migrate your current business number to our platform without losing your identity."
                            />
                            <FaqItem
                                question="Does the AI really handle sales?"
                                answer="Our AI is trained to handle product inquiries, recommend items based on your catalog, and guide customers to checkout. For complex issues, it seamlessly hands over to a human agent."
                            />
                            <FaqItem
                                question="Is there a setup fee?"
                                answer="No. We believe in earning your business. You only pay the monthly subscription fee."
                            />
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20">
                    <div className="container px-4 md:px-6 mx-auto">
                        <div className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-16 text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%,transparent_100%)] bg-size-[250%_250%,100%_100%] animate-[shimmer_3s_infinite]"></div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10">Ready to transform your customer experience?</h2>
                            <p className="text-primary-foreground/80 text-lg md:text-xl max-w-[600px] mx-auto mb-8 relative z-10">
                                Join thousands of businesses using Nenichat to automate sales and support.
                            </p>
                            <Button size="lg" variant="secondary" className="h-14 px-8 text-lg relative z-10">
                                Get Started for Free
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-10 border-t bg-muted/30">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <h3 className="font-semibold mb-4">Product</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link href="#" className="hover:text-foreground">Features</Link></li>
                                <li><Link href="#" className="hover:text-foreground">Pricing</Link></li>
                                <li><Link href="#" className="hover:text-foreground">Integrations</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Company</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link href="#" className="hover:text-foreground">About</Link></li>
                                <li><Link href="#" className="hover:text-foreground">Blog</Link></li>
                                <li><Link href="#" className="hover:text-foreground">Careers</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Resources</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link href="#" className="hover:text-foreground">Documentation</Link></li>
                                <li><Link href="#" className="hover:text-foreground">Help Center</Link></li>
                                <li><Link href="#" className="hover:text-foreground">Community</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Legal</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link href="#" className="hover:text-foreground">Privacy</Link></li>
                                <li><Link href="#" className="hover:text-foreground">Terms</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t">
                        <p className="text-sm text-muted-foreground">© 2024 Nenichat. All rights reserved.</p>
                        <div className="flex gap-4 mt-4 md:mt-0">
                            {/* Social icons would go here */}
                        </div>
                    </div>
                </div>
            </footer>
        </div >
    )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <Card className="bg-background border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
                <div className="mb-4">{icon}</div>
                <CardTitle className="text-xl">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription className="text-base">{description}</CardDescription>
            </CardContent>
        </Card>
    )
}

function PricingCard({ title, price, description, features, popular }: { title: string, price: string, description: string, features: string[], popular?: boolean }) {
    return (
        <Card className={`flex flex-col ${popular ? 'border-primary shadow-lg scale-105 relative' : ''}`}>
            {popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
            )}
            <CardHeader>
                <CardTitle className="text-2xl">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="text-4xl font-bold mb-6">{price}<span className="text-base font-normal text-muted-foreground">/month</span></div>
                <ul className="space-y-3">
                    {features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-primary" />
                            {feature}
                        </li>
                    ))}
                </ul>
            </CardContent>
            <div className="p-6 pt-0">
                <Button className="w-full" variant={popular ? "default" : "outline"}>
                    Choose {title}
                </Button>
            </div>
        </Card>
    )
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
    return (
        <div className="border rounded-lg p-4 bg-muted/30">
            <h3 className="font-semibold text-lg mb-2">{question}</h3>
            <p className="text-muted-foreground">{answer}</p>
        </div>
    )
}
