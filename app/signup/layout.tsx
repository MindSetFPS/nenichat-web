import { ThemeProvider } from "@/components/theme-provider"
import "@/styles/globals.css"
import Navigation from "@/components/marketing/navigation"
import { ToasterProvider } from "@/components/toaster-provider"
import { GalleryVerticalEnd } from "lucide-react"

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navigation />
          <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
              <a href="#" className="flex items-center gap-2 self-center font-medium">
                <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                Nenichat.
              </a>
              {children}
            </div>
          </div>
          <ToasterProvider />
        </ThemeProvider>
      </body>
    </html>
  )
}
