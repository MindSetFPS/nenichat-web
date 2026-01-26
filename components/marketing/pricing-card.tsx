import { Check, Rainbow } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ShineBorder } from "../ui/shine-border";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { RainbowButton } from "../ui/rainbow-button";
import Link from "next/link";

export function PricingCard({ title, price, description, features, popular }: { title: string, price: string, description: string, features: string[], popular?: boolean }) {
    return (
        <Card className={`flex flex-col ${popular ? ' shadow-lg scale-105 relative' : ''}`}>
            {popular ? <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} /> : <></>}
            {popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
            )}
            <CardHeader>
                <CardTitle className="text-2xl">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="text-4xl font-bold mb-6">{price}<span className="text-base font-normal text-muted-foreground">/month</span></div>
                <ul className="space-y-3">
                    {features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-primary" />
                            {feature}
                        </li>
                    ))}
                </ul>
            </CardContent>
            <div className="p-6 pt-0">
                {popular ?
                    <Link href="/#hero">
                        <RainbowButton className="font-bold"> Pre-registrate y obtén precio especial</RainbowButton>
                    </Link> :
                    <Button className="w-full" variant={popular ? "default" : "outline"}>
                        Pronto
                    </Button>
                }
            </div>
        </Card>
    )
}