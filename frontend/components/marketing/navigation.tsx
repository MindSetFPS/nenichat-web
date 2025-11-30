"use client"

import { Bot, Menu } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { RainbowButton } from "../ui/rainbow-button";
import { usePathname } from "next/navigation";

export default function Navigation() {
    const pathname = usePathname();
    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6 mx-auto">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                        <Bot className="h-5 w-5" />
                    </div>
                    <span>Nenichat</span>
                </div>
                <nav className=" md:flex gap-6 text-sm font-medium">
                </nav>
                <div className="flex items-center gap-4">
                    <div className=" md:flex items-center gap-4">
                        <Link href="/#features" className="hover:text-primary transition-colors hidden md:block">Features</Link>
                        {
                            pathname !== "/pricing" && (
                                <Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
                            )
                        }
                        {pathname !== "/" && (
                            <Link href="/#hero">
                                <RainbowButton>Pre-registrarme</RainbowButton>
                            </Link>
                        )}
                    </div>
                    {/* <Sheet >
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-2 border-0 w-full">
                            <nav className="flex flex-col gap-4 mt-8 font-bold">
                                <Link href="/" className="text-lg font-medium hover:text-primary transition-colors">
                                    Home
                                </Link>
                                <Link href="/pricing" className="text-lg font-medium hover:text-primary transition-colors">
                                    Pricing
                                </Link>
                                <Link href="/about" className="text-lg font-medium hover:text-primary transition-colors">
                                    About
                                </Link>
                                <hr className="my-4" />
                                <Link href="/login" className="w-full">
                                    <Button variant="ghost" className="w-full justify-start">Log in</Button>
                                </Link>
                                <Link href="/signup" className="w-full">
                                    <Button className="w-full">Get Started</Button>
                                </Link>
                            </nav>
                        </SheetContent>
                    </Sheet> */}
                </div>
            </div>
        </nav>
    )
}