'use client'

import Link from "next/link"
import { User, EyeOff, ChevronRight, Lock } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

export default function SettingsPage() {
    const content = [
        {
            title: "Account",
            description: "Manage your profile details and account security.",
            items: [
                { label: "Profile", href: "/profile", icon: User, description: "Change your name and profile picture" },
                // { label: "Security", href: "/settings/security", icon: Shield, description: "Two-step verification and password" },
            ]
        },
        {
            title: "Privacy",
            description: "Control who can see your info and contact you.",
            items: [
                { label: "Hidden Contacts", href: "/settings/hidden-contacts", icon: EyeOff, description: "Manage contacts you have hidden from your list" },
                // { label: "Blocked Contacts", href: "/settings/blocked", icon: Shield, description: "View and manage blocked users" },
                // { label: "Last Seen & Online", href: "/settings/privacy/last-seen", icon: Globe, description: "Control who can see when you're online" },
            ]
        },
        {
            title: "Subscriptions",
            description: "Manage your subscription plans and billing information.",
            items: [
                { label: "Subscription Plans", href: "/settings/subscriptions", icon: Lock, description: "View and manage your subscription plans" },
            ]
        }
    ]

    return (
        <>
            <h1 className="text-2xl font-bold">Settings</h1>
            <main className="flex-1 overflow-y-auto mt-2">
                <>
                    {
                        content.map((item, index) => (
                            <div className="mb-6" key={index}>
                                <h2 className="text-2xl pl-2 font-semibold tracking-tight">{item.title}</h2>
                                <p className="text-muted-foreground pl-1 mt-1 mb-4">
                                    {item.description}
                                </p>
                                <div className="space-y-4">
                                    {item.items.map((item, index) => (
                                        <div key={index}>
                                            <Link href={item.href} className="block">
                                                <div className="flex pl-1 py-1 items-center hover:bg-muted/50 rounded-lg transition-colors group cursor-pointer">
                                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mr-4 group-hover:bg-background transition-colors border">
                                                        <item.icon className="h-4 w-4 text-foreground" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-medium">{item.label}</h3>
                                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                                    </div>
                                                    <ChevronRight className="h-5 w-5 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    <h2 className="text-2xl pl-2 font-semibold tracking-tight">Apariencia</h2>
                    <p className="text-muted-foreground pl-1 mt-1 mb-4">Cambia entre modo oscuro y claro</p>
                    <ModeToggle />
                </>
            </main >
        </>
    )
}