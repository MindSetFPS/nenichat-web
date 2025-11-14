import { campaignRepository } from '@/repository/CampaignRepository';
import { EditCampaignForm } from '@/components/EditCampaignForm';
import { CardDescription } from '@/components/ui/card';

export default async function EditCampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = await campaignRepository.findById(id, true, true);

  if (!campaign) {
    return <div>Campaign not found</div>;
  }

  // Convert to plain object to avoid issues with Server->Client component passing
  const plainCampaign = {
    id: campaign.id,
    name: campaign.name,
    run_at: campaign.run_at,
    description: campaign.description,
    created_at: campaign.created_at,
    audienceIds: campaign.audienceIds,
    message: campaign.message,
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold tracking-tight">Edit Campaign</h2>
      <CardDescription className='mb-8 mt-4'>Make changes to your campaign here. Click save when you're done.</CardDescription>
      <EditCampaignForm campaign={plainCampaign} />
    </div>
  );
}
