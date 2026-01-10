import type { Metadata } from 'next'
import { Hero } from "@/components/marketing/landing/sections/hero"
import EcommerceCapabilities from "@/components/marketing/landing/sections/ecommerce-capabilities"
import PricingSection from "@/components/marketing/landing/sections/pricing-section"
import FaqSection from "@/components/marketing/landing/sections/fac-section"
import CtaSection from "@/components/marketing/landing/sections/cta-section"
import EaseOfUseSection from "@/components/marketing/landing/sections/ease-of-use-section"
import FeatureGrid from "@/components/marketing/landing/sections/feature-grid"

export const metadata: Metadata = {
    title: 'Nenichat',
    description: 'Transform your business communications with Nenichat\'s integrated commerce platform. Chat, sell, and grow your business all in one place. Seamless e-commerce integrated into your messaging workflow.',
    alternates: {
        canonical: 'https://nenichat.com',
    },
}

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <main className="flex-1">
                <Hero />

                <EcommerceCapabilities />

                <FeatureGrid />

                <EaseOfUseSection />

                {/* Todo: Social Proof & testimonials / Stats */}

                <PricingSection />

                <FaqSection />

                <CtaSection />
            </main>

        </div >
    )
}
