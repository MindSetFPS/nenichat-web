"use client"

import { Bot } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";

export default function Navigation() {
    const pathname = usePathname();
    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6 mx-auto">
                <Link href="/">
                    <div className="flex items-center gap-2 font-bold text-xl">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                            <Bot className="h-5 w-5" />
                        </div>
                        <span>Nenichat</span>
                    </div>
                </Link>
                <nav className=" md:flex gap-6 text-sm font-medium">
                </nav>
                <div className="flex items-center gap-4">
                    <div className=" md:flex items-center gap-4">
                        <Link href="/#features" className="hover:text-primary transition-colors hidden md:block">Features</Link>
                        <Link href="/#pricing" className="hover:text-primary transition-colors">Pricing</Link>
                    </div>
                    <ModeToggle />
                </div>
            </div>
        </nav>
    )
}