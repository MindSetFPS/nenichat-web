"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function WaitlistForm() {
    return (
        <form className="flex flex-col sm:flex-row gap-2" onSubmit={(e) => e.preventDefault()}>
            <Input
                type="text"
                placeholder="Enter email or phone number"
                className="h-12 bg-background/80 backdrop-blur-sm border-primary/20"
            />
            <Button size="lg" className="h-12 px-8 shrink-0">
                Join Waitlist
            </Button>
        </form>
    )
}
