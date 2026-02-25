import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { CalendarDays, MessageSquare } from "lucide-react";
import { ICampaign } from "@/Nenichat/Campaigns/domain/ICampaign";
import Link from "next/link";

interface CampaignCardProps {
    campaign: ICampaign;
}

/**
 * Renders an individual campaign card.
 */
export function CampaignCard({ campaign }: CampaignCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{campaign.name}</CardTitle>
                {campaign.run_at && (
                    <CardDescription className="flex items-center gap-1">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(campaign.run_at).toLocaleString()}</span>
                    </CardDescription>
                )}
            </CardHeader>
            {campaign.description && (
                <CardContent className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <p>{campaign.description}</p>
                </CardContent>
            )}
            <CardFooter className="flex-col justify-between gap-2">
                <Link href={`/campaigns/${campaign.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                        Edit Campaign
                    </Button>
                </Link>
                <Button variant="default" className="w-full" disabled={campaign.next_run_at !== null}>
                    Send Campaign
                </Button>
            </CardFooter>
        </Card>
    );
}

interface CampaignSectionProps {
    title: string;
    campaigns: ICampaign[];
}

/**
 * Renders a section of campaigns with a title.
 */
export function CampaignSection({ title, campaigns }: CampaignSectionProps) {
    if (campaigns.length === 0) return null;

    return (
        <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {campaigns.map((campaign) => (
                    <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
            </div>
        </section>
    );
}
