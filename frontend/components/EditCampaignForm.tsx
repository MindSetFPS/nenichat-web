"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CampaignForm } from "./forms/CampaignForm";
import { ICampaign } from "@/dto/ICampaign";

interface EditCampaignFormProps {
  campaign: ICampaign;
}

export function EditCampaignForm({ campaign }: EditCampaignFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: { name: string; description: string; run_at?: Date }) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/campaigns/${campaign.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          run_at: data.run_at,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update campaign');
      }

      toast.success('Campaign updated successfully!');
      router.push('/campaigns');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CampaignForm
      onSubmit={handleSubmit}
      initialData={campaign}
      isLoading={isLoading}
      submitButtonText="Save Changes"
    />
  );
}
