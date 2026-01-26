"use client"

import { HeroChatAnimation } from "../hero-chat-animation";
import { WaitlistForm } from "../../waitlist-form";
import { Badge } from "../../../ui/badge";
import { DotPattern } from "../../../ui/dot-pattern";
import { cn } from "@/lib/utils";

export function Hero({ phoneNumber }: { phoneNumber: string }) {
    return (
        <section id="hero" className="relative py-4 md:py-32 overflow-hidden">
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
                        {/* <h1 className="text-3xl md:text-6xl font-extrabold tracking-tight lg:text-5xl mb-6 bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
                            Hacemos que tus chats <br className="hidden md:block" />
                            <span className="text-primary">se transformen en cash 💰</span>
                        </h1> */}
                        {/* Alternative Text */}
                        <h1 className="text-3xl md:text-6xl font-extrabold tracking-tight lg:text-5xl mb-6 bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
                            De mandar 20 mensajes, <br />
                            <div className="relative mx-auto inline-block w-max [filter:drop-shadow(0px_1px_3px_rgba(27,_37,_80,_0.14))]">
                                <div className="relative bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500">
                                    <span className="">a vender con solo 2 clicks.</span>
                                </div>
                            </div>
                        </h1>
                        {/* <p className="mx-auto lg:mx-0 max-w-[700px] text-primary md:text-xl mb-8">
                            Transforma tus chats en una tienda inteligente que vende 24/7. Desde gestionar pedidos y stock hasta calcular tus ganancias.
                        </p> */}

                        {/* Third text */}
                        {/* improve style */}
                        {/* <p className="mx-auto lg:mx-0 max-w-[700px] text-primary md:text-xl mb-8">
                            Con Nenichat, vender te toma solo 2 clicks, no 20 mensajes.
                        </p> */}

                        <p className="mx-auto lg:mx-0 max-w-[700px] text-primary md:text-xl mb-8">
                            ¡Deja de perderte entre chats, apuntes y excels, Nenichat tiene todas las herramientas que necesitas para tu emprendimiento!
                        </p>

                        <div className="w-full max-w-lg space-y-2 mx-auto lg:mx-0">
                            <WaitlistForm phoneNumber={phoneNumber!} />
                            <p className="text-xs text-primary text-center lg:text-left pl-1">
                                Aparta tu lugar hoy y obtén $999mxn en créditos.
                            </p>
                        </div>

                        {/* <div className="mt-12 text-sm text-muted-foreground">
                            <p>Trusted by forward-thinking companies</p>
                            <div className="flex flex-wrap justify-center lg:justify-start gap-8 mt-4 opacity-70 grayscale">
                                <div className="flex items-center gap-2 font-semibold"><Globe className="h-4 w-4" /> Acme Corp</div>
                                <div className="flex items-center gap-2 font-semibold"><Zap className="h-4 w-4" /> BoltShift</div>
                                <div className="flex items-center gap-2 font-semibold"><Shield className="h-4 w-4" /> SecureNet</div>
                            </div>
                        </div> */}
                    </div>

                    <HeroChatAnimation />
                </div>
            </div>
        </section>
    )
}