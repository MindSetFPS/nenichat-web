"use client"

import { Globe, Shield, Zap } from "lucide-react";
import { HeroChatAnimation } from "../hero-chat-animation";
import { WaitlistForm } from "../../waitlist-form";
import { Badge } from "../../../ui/badge";
import { DotPattern } from "../../../ui/dot-pattern";
import { cn } from "@/lib/utils";

export function Hero() {
    return (
        <section id="hero" className="relative py-20 md:py-32 overflow-hidden">
            <DotPattern
                width={20}
                height={20}
                cx={1}
                cy={1}
                cr={1}
                className={cn("[mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)]")}
            />

            <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[14px_24px]"></div>
            <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>

            <div className="container px-4 md:px-6 mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left Column: Text Content */}
                    <div className="text-center lg:text-left">
                        <Badge className="mb-4" variant="secondary">Prelanzamiento</Badge>
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight lg:text-7xl mb-6 bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
                            Automate Your Chat. <br className="hidden md:block" />
                            <span className="text-primary">Boost Your Sales.</span>
                        </h1>
                        <p className="mx-auto lg:mx-0 max-w-[700px] text-muted-foreground md:text-xl mb-8">
                            The all-in-one platform to automate customer interactions, track sales, and launch high-converting marketing campaigns on WhatsApp.
                        </p>

                        <div className="w-full max-w-lg space-y-2 mx-auto lg:mx-0">
                            <WaitlistForm />
                            <p className="text-xs text-muted-foreground text-center lg:text-left pl-1">
                                Pre-registrate y obtén un precio preferencial de por vida.
                            </p>
                        </div>
                        <div className="mt-12 text-sm text-muted-foreground">
                            <p>Trusted by forward-thinking companies</p>
                            <div className="flex flex-wrap justify-center lg:justify-start gap-8 mt-4 opacity-70 grayscale">
                                {/* Placeholders for logos */}
                                <div className="flex items-center gap-2 font-semibold"><Globe className="h-4 w-4" /> Acme Corp</div>
                                <div className="flex items-center gap-2 font-semibold"><Zap className="h-4 w-4" /> BoltShift</div>
                                <div className="flex items-center gap-2 font-semibold"><Shield className="h-4 w-4" /> SecureNet</div>
                            </div>
                        </div>
                    </div>

                    <HeroChatAnimation />
                </div>
            </div>
        </section>
    )
}