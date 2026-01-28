import { ICampaign } from '@/Nenichat/Campaigns/domain/ICampaign';
import { campaignRepository } from '@/Nenichat/Campaigns/infra/persistance/CampaignRepository';
import { EditCampaignForm } from '@/components/edit-campaign-form';
import { cronToStr } from '@/Nenichat/Shared/domain/cron-to-string-converter';

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = await campaignRepository.findById(id, true, true);

  if (!campaign) return <div>Campaign not found</div>;

  const parsedCron = cronToStr(campaign?.cron_expression || '');

  const plainCampaign: ICampaign = {
    ...campaign,
    interval: campaign.interval || parsedCron?.interval,
    day_of_month: campaign.day_of_month || parsedCron?.dayOfMonth,
    day_of_week: campaign.day_of_week || parsedCron?.weekday,
  };

  // If recurring, update run_at time to match cron time for the UI
  if (campaign.frequency_type === 'recurring' && parsedCron) {
    const runAt = new Date(campaign.run_at || new Date());
    runAt.setHours(parseInt(parsedCron.hour, 10));
    runAt.setMinutes(parseInt(parsedCron.minute, 10));
    runAt.setSeconds(0);
    plainCampaign.run_at = runAt;
  }

  return (
    <>

      <h2 className="text-3xl font-bold tracking-tight">Editar campaña</h2>

      <EditCampaignForm campaign={plainCampaign} />
    </>
  );
}
