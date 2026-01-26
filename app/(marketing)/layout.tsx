import type { Metadata } from 'next'
import "@/styles/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Navigation from "@/components/marketing/navigation"
import Footer from "@/components/marketing/landing/sections/footer"
import { ToasterProvider } from "@/components/toaster-provider"
import { StructuredData } from "@/components/marketing/structured-data"

export const dynamic = "force-static";

export const metadata: Metadata = {
  metadataBase: new URL('https://nenichat.com'),
  title: {
    default: 'Nenichat - E-commerce completo en tus chats',
    template: '%s | Nenichat'
  },
  description: 'E-commerce completo en tus chats. Administra y automatiza tus ventas en WhatsApp.',
  keywords: ['whatsapp crm', 'whatsapp automation', 'e-commerce', 'conversational commerce', 'whatsapp chatbot'],
  authors: [{ name: 'Nenichat' }],
  creator: 'Nenichat',
  publisher: 'Nenichat',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: 'https://nenichat.com',
    siteName: 'Nenichat',
    title: 'Nenichat - E-commerce completo en tus chats',
    description: 'E-commerce completo en tus chats. Administra y automatiza tus ventas en WhatsApp.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Nenichat Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nenichat - E-commerce completo en tus chats',
    description: 'E-commerce completo en tus chats. Administra y automatiza tus ventas en WhatsApp.',
    images: ['/twitter-image.png'],
    creator: '@nenichat',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Replace with actual verification code from Google Search Console
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es-MX" suppressHydrationWarning>
      <head>
        <StructuredData />
        <link
          rel="icon"
          href="/icon.svg"
          type="image/svg+xml"
          sizes="16x16 32x32 64x64"
        />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navigation />
          {children}
          <Footer />
          <ToasterProvider />
        </ThemeProvider>
      </body>
    </html>
  )
}
