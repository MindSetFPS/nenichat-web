import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EditMessageDialog } from "@/components/EditMessageDialog";
import { CalendarDays, MessageSquare, Users } from "lucide-react";

const campaigns = [
  {
    id: 1,
    name: "Welcome Campaign",
    audience: "New Users",
    message: "Welcome to our platform! We are excited to have you.",
    runAt: "2025-11-09", // Past date (yesterday)
  },
  {
    id: 2,
    name: "Black Friday Promo",
    audience: "All Users",
    message: "Get 50% off on all products this Black Friday!",
    runAt: "2025-11-05", // Past date (this week)
  },
  {
    id: 3,
    name: "New Feature Announcement",
    audience: "Active Users",
    message: "We've just launched a new feature! Check it out now.",
    runAt: "2025-10-20", // Past date (this month)
  },
  {
    id: 4,
    name: "Upcoming Sale",
    audience: "All Users",
    message: "Get ready for our amazing upcoming sale!",
    runAt: "2025-12-01", // Future date
  },
  {
    id: 5,
    name: "Holiday Greetings",
    audience: "All Users",
    message: "Happy holidays from our team!",
    runAt: "2025-12-25", // Future date
  },
  {
    id: 6,
    name: "Daily Digest",
    audience: "Subscribers",
    message: "Your daily dose of news and updates.",
    runAt: "2025-11-10", // Today
  },
  {
    id: 7,
    name: "Weekly Newsletter",
    audience: "Subscribers",
    message: "Our weekly roundup of exciting content.",
    runAt: "2025-11-08", // This week
  },
  {
    id: 8,
    name: "Monthly Report",
    audience: "Premium Users",
    message: "Your personalized monthly performance report.",
    runAt: "2025-10-30", // This month
  },
];

export default function CampaignsPage() {
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Normalize 'now' to start of today for comparison

  const startOfDay = new Date(now);

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as start of week

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const sortedCampaigns = campaigns.sort(
    (a, b) => new Date(b.runAt).getTime() - new Date(a.runAt).getTime()
  );

  const futureCampaigns = sortedCampaigns.filter(
    (campaign) => new Date(campaign.runAt) > now
  );

  const todayCampaigns = sortedCampaigns.filter(
    (campaign) => new Date(campaign.runAt).toDateString() === startOfDay.toDateString()
  );

  const thisWeekCampaigns = sortedCampaigns.filter(
    (campaign) =>
      new Date(campaign.runAt) >= startOfWeek && new Date(campaign.runAt) < startOfDay
  );

  const thisMonthCampaigns = sortedCampaigns.filter(
    (campaign) =>
      new Date(campaign.runAt) >= startOfMonth && new Date(campaign.runAt) < startOfWeek
  );

  const olderCampaigns = sortedCampaigns.filter(
    (campaign) => new Date(campaign.runAt) < startOfMonth
  );

  const renderCampaignSection = (title: string, campaignsToRender: typeof campaigns) => {
    if (campaignsToRender.length === 0) return null;
    return (
      <>
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {campaignsToRender.map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader>
                <CardTitle>{campaign.name}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{campaign.audience}</span>
                </CardDescription>
                <CardDescription className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span>{campaign.runAt}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-1 text-sm text-muted-foreground">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <p>{campaign.message}</p>
              </CardContent>
              <CardFooter className="flex-col justify-between gap-2">
                <EditMessageDialog
                  campaignId={campaign.id}
                  initialMessage={campaign.message}
                />
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
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <Button>Create Campaign</Button>
      </div>

      {renderCampaignSection("Upcoming Campaigns", futureCampaigns)}
      {renderCampaignSection("Today's Campaigns", todayCampaigns)}
      {renderCampaignSection("This Week's Campaigns", thisWeekCampaigns)}
      {renderCampaignSection("This Month's Campaigns", thisMonthCampaigns)}
      {renderCampaignSection("Older Campaigns", olderCampaigns)}
    </div>
  );
}