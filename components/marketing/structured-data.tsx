/**
 * Structured Data component for SEO
 * Outputs JSON-LD schema markup for search engines
 */
export function StructuredData() {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Nenichat",
        "description": "Full commerce in your chats. Streamline your business communications with integrated e-commerce capabilities.",
        "url": "https://nenichat.com",
        "applicationCategory": "BusinessApplication",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "operatingSystem": "Web",
        "browserRequirements": "Requires JavaScript. Requires HTML5."
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    )
}
