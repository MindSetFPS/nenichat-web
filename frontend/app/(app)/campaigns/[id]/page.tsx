import { ICampaign } from '@/Nenichat/Campaigns/domain/ICampaign';
import { campaignRepository } from '@/Nenichat/Campaigns/infra/persistance/CampaignRepository';
import { EditCampaignForm } from '@/components/edit-campaign-form';
import { HeaderAction } from '@/components/header-action';

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = await campaignRepository.findById(id, true, true);

  if (!campaign) {
    return <div>Campaign not found</div>;
  }

  // Convert to plain object to avoid issues with Server->Client component passing
  const plainCampaign: ICampaign = {
    id: campaign.id,
    name: campaign.name,
    run_at: campaign.run_at,
    description: campaign.description,
    created_at: campaign.created_at,
    audienceIds: campaign.audienceIds,
    message: campaign.message,
    frequency_type: campaign.frequency_type,
    payload: campaign.payload,
    enabled: campaign.enabled,
    updated_at: campaign.updated_at,
  };

  return (
    <>
      <HeaderAction>
        <h2 className="text-3xl font-bold tracking-tight">Editar campaña</h2>
      </HeaderAction>
      <EditCampaignForm campaign={plainCampaign} />
    </>
  );
}
