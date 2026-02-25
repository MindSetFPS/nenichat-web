import { CalendarDays } from "lucide-react";
import { SupabaseCampaignRepository } from '@/Nenichat/Campaigns/infra/persistance/SupabaseCampaignRepository';
import { ICampaign } from '@/Nenichat/Campaigns/domain/ICampaign';
import { CreateCampaignDialog } from "@/components/CreateCampaignDialog";
import { EmptyList } from "@/components/empty-list";
import { PageHeader } from "@/components/ui/page-header";
import { CampaignSection } from "@/components/campaigns/campaign-section";

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getBusinessFromUser } from '@/lib/user-auth';

export const dynamic = 'force-dynamic';

export default async function CampaignsPage() {
  const supabase = await createServerSupabaseClient();
  const { business, error: authError } = await getBusinessFromUser(supabase);

  if (authError || !business) return <div>Unauthorized</div>;

  const campaignRepository = new SupabaseCampaignRepository(supabase);
  const allCampaigns: ICampaign[] = await campaignRepository.list(business.id, 0, 100);


  if (allCampaigns.length === 0) {
    return (
      <>
        <PageHeader />
        <EmptyList
          title="No Campaigns"
          description="It looks like you haven't created any campaigns. Start by creating one!"
          action={<CreateCampaignDialog />}
          icon={<CalendarDays className="w-12 h-12 text-primary" />}
        />
      </>
    )
  }

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



  return (
    <>
      <PageHeader title="Campaigns">
        {allCampaigns.length > 0 && <CreateCampaignDialog />}
      </PageHeader>

      <div className="overflow-y-auto h-full">
        {allCampaigns.length === 0 ? (
          <EmptyList
            title="No Campaigns"
            description="It looks like you haven't created any campaigns. Start by creating one!"
            action={<CreateCampaignDialog />}
            icon={<CalendarDays className="w-12 h-12 text-primary" />}
          />
        ) : (
          <>
            <p>To make it work correctly we need to:
              1. Randomize the message to avoid spam filters.
              2. Only send message to currently engaged users (they have talked in previous 24 hours.
              3. Time limits and randomization to avoid being marked as spam.
            </p>
            <CampaignSection title="Upcoming Campaigns" campaigns={futureCampaigns} />
            <CampaignSection title="Today's Campaigns" campaigns={todayCampaigns} />
            <CampaignSection title="This Week's Campaigns" campaigns={thisWeekCampaigns} />
            <CampaignSection title="This Month's Campaigns" campaigns={thisMonthCampaigns} />
            <CampaignSection title="Older Campaigns" campaigns={olderCampaigns} />
          </>
        )}
      </div>
    </>
  );
}