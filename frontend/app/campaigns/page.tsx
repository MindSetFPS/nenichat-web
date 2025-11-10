import { Button } from "@/components/ui/button";
import {
  Item,
  ItemGroup,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
} from "@/components/ui/item";

const campaigns = [
  {
    id: 1,
    name: "Welcome Campaign",
    audience: "New Users",
    message: "Welcome to our platform! We are excited to have you.",
  },
  {
    id: 2,
    name: "Black Friday Promo",
    audience: "All Users",
    message: "Get 50% off on all products this Black Friday!",
  },
  {
    id: 3,
    name: "New Feature Announcement",
    audience: "Active Users",
    message: "We've just launched a new feature! Check it out now.",
  },
];

export default function CampaignsPage() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <Button>Create Campaign</Button>
      </div>
      <ItemGroup>
        {campaigns.map((campaign) => (
          <Item key={campaign.id} className="border-b">
            <ItemContent>
              <ItemTitle>{campaign.name}</ItemTitle>
              <ItemDescription>
                <p><span className="font-semibold">Audience:</span> {campaign.audience}</p>
                <p><span className="font-semibold">Message:</span> {campaign.message}</p>
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button variant="outline" size="sm">
                Edit Message
              </Button>
              <Button variant="default" size="sm">
                Send Campaign
              </Button>
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>
    </div>
  );
}