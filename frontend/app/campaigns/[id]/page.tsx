import { campaignRepository } from '@/repository/CampaignRepository';
import { EditCampaignForm } from '@/components/EditCampaignForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default async function EditCampaignPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const campaign = await campaignRepository.findById(id);

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
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold tracking-tight">Edit Campaign</h2>
      <CardDescription className='mb-8 mt-4'>Make changes to your campaign here. Click save when you're done.</CardDescription>
      <EditCampaignForm campaign={plainCampaign} />
    </div>
  );
}
