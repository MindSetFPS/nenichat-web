"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CampaignForm } from "./forms/CampaignForm";
import { ICampaign } from "@/dto/ICampaign";
import { Button } from "@/components/ui/button"; // Import Button component
import { Loader2 } from "lucide-react"; // Import Loader2 for loading spinner

interface EditCampaignFormProps {
  campaign: ICampaign;
}

export function EditCampaignForm({ campaign }: EditCampaignFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false); // New state for execute button

  const handleSubmit = async (data: {
    name: string;
    description: string;
    run_at?: Date;
    audienceIds?: number[];
  }) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/campaigns/${campaign.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          run_at: data.run_at,
          audienceIds: data.audienceIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update campaign");
      }

      toast.success("Campaign updated successfully!");
      router.push("/campaigns");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteCampaign = async (e) => {
    e.preventDefault();
    setIsExecuting(true);
    try {
      const response = await fetch(`/api/campaigns/${campaign.id}/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to execute campaign");
      }

      toast.success("Campaign execution initiated!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-4">
      <CampaignForm
        onSubmit={handleSubmit}
        initialData={campaign}
        isLoading={isLoading}
        submitButtonText="Save Changes"
      />
      <Button
        onClick={handleExecuteCampaign}
        disabled={isExecuting || isLoading}
        className="w-full"
      >
        {isExecuting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Execute Campaign Now
      </Button>
    </div>
  );
}
