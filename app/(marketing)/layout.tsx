import type { Metadata } from 'next'
import "@/styles/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Navigation from "@/components/marketing/navigation"
import Footer from "@/components/marketing/landing/sections/footer"
import { ToasterProvider } from "@/components/toaster-provider"
import { StructuredData } from "@/components/marketing/structured-data"

export const metadata: Metadata = {
  metadataBase: new URL('https://nenichat.com'),
  title: {
    default: 'Nenichat - Full Commerce in Your Chats',
    template: '%s | Nenichat'
  },
  description: 'Full commerce in your chats. Streamline your business communications with integrated e-commerce capabilities.',
  keywords: ['chat commerce', 'e-commerce', 'business chat', 'messaging platform', 'whatsapp commerce', 'conversational commerce'],
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
    locale: 'en_US',
    url: 'https://nenichat.com',
    siteName: 'Nenichat',
    title: 'Nenichat - Full Commerce in Your Chats',
    description: 'Full commerce in your chats. Streamline your business communications with integrated e-commerce capabilities.',
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
    title: 'Nenichat - Full Commerce in Your Chats',
    description: 'Full commerce in your chats. Streamline your business communications with integrated e-commerce capabilities.',
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
    <html lang="en" suppressHydrationWarning>
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
