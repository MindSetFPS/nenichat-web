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
import { campaignRepository } from '@/Nenichat/Campaigns/infra/persistance/CampaignRepository';
import { ICampaign } from '@/Nenichat/Campaigns/domain/ICampaign';
import { CreateCampaignDialog } from "@/components/CreateCampaignDialog";
import Link from "next/link";
import { EmptyList } from "@/components/empty-list";
import { PageHeader } from "@/components/ui/page-header";

export const dynamic = 'force-dynamic';

export default async function CampaignsPage() {
  const allCampaigns: ICampaign[] = await campaignRepository.list(0, 100);

  const now = new Date();
  now.setHours(0, 0, 0, 0); // Normalize 'now' to start of today for comparison

  const startOfDay = new Date(now);

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as start of week

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const sortedCampaigns = allCampaigns.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const futureCampaigns = sortedCampaigns.filter(
    (campaign) => campaign.run_at && new Date(campaign.run_at) > now && new Date(campaign.run_at).toDateString() !== startOfDay.toDateString()
  );

  const todayCampaigns = sortedCampaigns.filter(
    (campaign) => campaign.run_at && new Date(campaign.run_at).toDateString() === startOfDay.toDateString()
  );

  const thisWeekCampaigns = sortedCampaigns.filter(
    (campaign) =>
      campaign.run_at &&
      new Date(campaign.run_at) >= startOfWeek &&
      new Date(campaign.run_at) < startOfDay
  );

  const thisMonthCampaigns = sortedCampaigns.filter(
    (campaign) =>
      campaign.run_at &&
      new Date(campaign.run_at) >= startOfMonth &&
      new Date(campaign.run_at) < startOfWeek
  );

  const olderCampaigns = sortedCampaigns.filter(
    (campaign) =>
      !campaign.run_at || new Date(campaign.run_at) < startOfMonth
  );

  const renderCampaignSection = (title: string, campaignsToRender: ICampaign[]) => {
    if (campaignsToRender.length === 0) return null;
    return (
      <>
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {campaignsToRender.map((campaign) => (
            <Card key={campaign.id}>
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
                <Button variant="default" className="w-full">
                  Send Campaign
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </>
    );
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <PageHeader content={<h1 className="text-2xl font-bold">Campaigns</h1>} />
        <CreateCampaignDialog />
      </div>
      <p>To make it work correctly we need to:
        1. Randomize the message to avoid spam filters.
        2. Only send message to currently engaged users (they have talked in previous 24 hours.
        3. Time limits and randomization to avoid being marked as spam.
      </p>

      {allCampaigns.length === 0 ? (
        <EmptyList
          title="No Campaigns"
          description="It looks like you haven't created any campaigns. Start by creating one!"
          action={<CreateCampaignDialog />}
          icon={<CalendarDays className="w-12 h-12 text-primary" />}
        />
      ) : (
        <>
          {renderCampaignSection("Upcoming Campaigns", futureCampaigns)}
          {renderCampaignSection("Today's Campaigns", todayCampaigns)}
          {renderCampaignSection("This Week's Campaigns", thisWeekCampaigns)}
          {renderCampaignSection("This Month's Campaigns", thisMonthCampaigns)}
          {renderCampaignSection("Older Campaigns", olderCampaigns)}
        </>
      )}
    </>
  );
}