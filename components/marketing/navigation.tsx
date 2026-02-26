"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import Image from "next/image";

export default function Navigation() {
    const pathname = usePathname();
    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6 mx-auto">
                <Link href="/">
                    <div className="flex items-center gap-2 font-bold text-xl">
                        <Image src="/icon.svg" alt="Logo" width={24} height={24} />
                        <span>Nenichat</span>
                    </div>
                </Link>
                <nav className=" md:flex gap-6 text-sm font-medium">
                </nav>
                <div className="flex items-center gap-4">
                    <div className=" md:flex items-center gap-4">
                        <Link href="/#features" className="hover:text-primary transition-colors hidden md:block">Features</Link>
                        <Link href="/#pricing" className="hover:text-primary transition-colors">Pricing</Link>
                        <Link href="/signup" className={`hover:text-primary transition-colors ${pathname === "/register" ? "text-primary" : ""}`}>Crear una cuenta gratis</Link>
                    </div>
                    <ModeToggle />
                </div>
            </div>
        </nav>
    )
}