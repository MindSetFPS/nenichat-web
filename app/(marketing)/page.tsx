import type { Metadata } from 'next'
import { Hero } from "@/components/marketing/landing/sections/hero"
import EcommerceCapabilities from "@/components/marketing/landing/sections/ecommerce-capabilities"
import PricingSection from "@/components/marketing/landing/sections/pricing-section"
import FaqSection from "@/components/marketing/landing/sections/fac-section"
import CtaSection from "@/components/marketing/landing/sections/cta-section"
// import EaseOfUseSection from "@/components/marketing/landing/sections/ease-of-use-section"
import NeniFlow from "@/components/marketing/landing/sections/neni-flow"

export const dynamic = "force-static";

export const metadata: Metadata = {
    title: 'Nenichat',
    description: 'Transform your business communications with Nenichat\'s integrated commerce platform. Chat, sell, and grow your business all in one place. Seamless e-commerce integrated into your messaging workflow.',
    alternates: {
        canonical: 'https://nenichat.com',
    },
}

// get env variable for phone number
const phoneNumber = process.env.NEXT_PUBLIC_PHONE_NUMBER;

if (!phoneNumber) {
    throw new Error("NEXT_PUBLIC_PHONE_NUMBER is not defined");
}

export default function LandingPage() {
    return (
        <main className="flex-1 flex flex-col min-h-screen bg-background text-foreground">
            <Hero phoneNumber={phoneNumber!} />

            <EcommerceCapabilities />

            {/* <EaseOfUseSection /> */}

            <NeniFlow />

            {/* Todo: Social Proof & testimonials / Stats */}

            <PricingSection />

            <FaqSection />

            <CtaSection />
        </main>
    )
}
