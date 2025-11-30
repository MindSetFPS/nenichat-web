"use client"

import { useState } from "react"
import { ShoppingBag, Check, Package, MousePointer2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function HeroChatAnimation() {
    const [hoveredBubble, setHoveredBubble] = useState<number | null>(null)

    return (
        <div className="relative w-full max-w-[600px] mx-auto lg:mr-0">
            <div className="bg-[#efeae2] dark:bg-[#0b141a] border rounded-2xl shadow-2xl overflow-hidden flex h-auto">
                {/* Main Chat Column */}
                <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto relative z-10">
                    {/* Bubble 1: Green, Right */}
                    <div className="self-end max-w-[85%] animate-chat-bubble" style={{ animationDelay: '0.2s' }}>
                        <div className="bg-[#d9fdd3] dark:bg-[#005c4b] text-black dark:text-white rounded-lg rounded-tr-none px-3 py-2 shadow-sm">
                            <p className="text-sm">Hi! Do you have an Optimus Prime action figure? 🚚</p>
                            <div className="text-[10px] text-gray-500 dark:text-gray-300 text-right mt-1">10:42 AM</div>
                        </div>
                    </div>

                    {/* Bubble 2: White, Left - Hover Trigger */}
                    <div
                        className="self-start max-w-[85%] animate-chat-bubble cursor-pointer transition-transform hover:scale-[1.02] relative group"
                        style={{ animationDelay: '1.5s' }}
                        onMouseEnter={() => setHoveredBubble(2)}
                        onMouseLeave={() => setHoveredBubble(null)}
                    >
                        <div className={cn(
                            "bg-white dark:bg-[#202c33] text-black dark:text-white rounded-lg rounded-tl-none px-3 py-2 shadow-sm border transition-colors",
                            hoveredBubble === 2 && "ring-2 ring-primary/50 border-primary"
                        )}>
                            <p className="text-sm">Hey there! Great choice. We have it in stock! 🛍️</p>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400 text-right mt-1">10:42 AM</div>
                        </div>

                        {/* Hover Hint */}
                        <div className={cn(
                            "absolute -right-8 top-1/2 -translate-y-1/2 transition-opacity duration-500",
                            hoveredBubble === 2 ? "opacity-0" : "opacity-100"
                        )}>
                            <div className="bg-primary/10 p-1.5 rounded-full animate-pulse">
                                <MousePointer2 className="h-4 w-4 text-primary fill-primary/20" />
                            </div>
                        </div>
                    </div>

                    {/* Bubble 3: Green, Right */}
                    <div className="self-end max-w-[85%] animate-chat-bubble" style={{ animationDelay: '3s' }}>
                        <div className="bg-[#d9fdd3] dark:bg-[#005c4b] text-black dark:text-white rounded-lg rounded-tr-none px-3 py-2 shadow-sm">
                            <p className="text-sm">Yes, please! Send it over.</p>
                            <div className="text-[10px] text-gray-500 dark:text-gray-300 text-right mt-1">10:43 AM</div>
                        </div>
                    </div>

                    {/* Bubble 4: White, Left - Hover Trigger */}
                    <div
                        className="self-start max-w-[85%] animate-chat-bubble cursor-pointer transition-transform hover:scale-[1.02] relative group"
                        style={{ animationDelay: '4.5s' }}
                        onMouseEnter={() => setHoveredBubble(4)}
                        onMouseLeave={() => setHoveredBubble(null)}
                    >
                        <div className={cn(
                            "bg-white dark:bg-[#202c33] text-black dark:text-white rounded-lg rounded-tl-none px-3 py-2 shadow-sm border transition-colors",
                            hoveredBubble === 4 && "ring-2 ring-primary/50 border-primary"
                        )}>
                            <p className="text-sm">We got your order! We will send it to your address in 2 days.</p>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400 text-right mt-1">10:44 AM</div>
                        </div>

                        {/* Hover Hint */}
                        <div className={cn(
                            "absolute -right-8 top-1/2 -translate-y-1/2 transition-opacity duration-500",
                            hoveredBubble === 4 ? "opacity-0" : "opacity-100"
                        )}>
                            <div className="bg-primary/10 p-1.5 rounded-full animate-pulse">
                                <MousePointer2 className="h-4 w-4 text-primary fill-primary/20" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Side Panel - Semitransparent Overlay */}
                <div className={cn(
                    "w-3/4 md:w-1/3 lg:w-7/12 border-l bg-background/80 opacity-0 backdrop-blur-md transition-all duration-300 ease-in-out absolute right-0 top-0 bottom-0 z-20 translate-x-full",
                    hoveredBubble !== null && "translate-x-0 opacity-100"
                )}>
                    <div className="h-full p-4 flex flex-col">
                        {hoveredBubble === 2 && (
                            <div className="animate-in slide-in-from-right fade-in duration-300 space-y-4">
                                <div className="text-xs font-semibold text-muted-foreground tracking-wider">I have found it. Now i will confirm the user we have stock.</div>
                                <div className="bg-card rounded-lg border p-3 shadow-sm">
                                    <div className="aspect-square md:aspect-auto lg:h-32 bg-muted rounded-md mb-3 flex items-center justify-center">
                                        <ShoppingBag className="h-8 w-8 text-muted-foreground/50" />
                                    </div>
                                    <h4 className="font-medium text-sm leading-tight mb-1">Optimus Prime Action Figure</h4>
                                    <p className="text-xs text-muted-foreground mb-2">Transformers Gen 1</p>
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-sm">$49.99</span>
                                        <span className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded-full">In Stock</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {hoveredBubble === 4 && (
                            <div className="animate-in slide-in-from-right fade-in duration-300 space-y-2">
                                <div className="text-xs font-semibold text-muted-foreground tracking-wider">The user has confirmed the order. I will save it in the database and confirm the delivery date</div>
                                <div className="bg-card rounded-lg border p-4 shadow-sm text-center space-y-3">
                                    <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                                        <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-base">Order Confirmed</h4>
                                        <p className="text-xs text-muted-foreground">#ORD-2024-881</p>
                                    </div>
                                    <div className="border-t pt-3 w-full">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-muted-foreground">Est. Delivery</span>
                                            <span className="font-medium">2 Days</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Carrier</span>
                                            <span className="font-medium">FedEx</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-100 dark:border-blue-800 flex items-start gap-2">
                                    <Package className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                                        Tracking number generated. You'll receive updates automatically.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Decorative elements behind chat */}
            <div className="absolute -top-10 -right-10 h-20 w-20 bg-primary/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute -bottom-10 -left-10 h-32 w-32 bg-blue-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
    )
}
