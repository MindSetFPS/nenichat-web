"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CampaignForm } from "./campaign-form";
import { ICampaign } from "@/Nenichat/Campaigns/domain/ICampaign";
import { NewCampaignData } from "@/Nenichat/Campaigns/domain/new-campaign-dto";
import { Button } from "@/components/ui/button"; // Import Button component
import { Loader2 } from "lucide-react"; // Import Loader2 for loading spinner

interface EditCampaignFormProps {
  campaign: ICampaign;
}

export function EditCampaignForm({ campaign }: EditCampaignFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false); // New state for execute button

  const handleSubmit = async (data: NewCampaignData) => {
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
          message: data.message,
          run_at: data.runAt,
          audienceIds: data.audienceIds,
          interval: data.interval,
          day_of_month: data.dayOfMonth,
          day_of_week: data.dayOfWeek,
          frequency_type: data.frequency_type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar la campaña");
      }

      toast.success("¡Campaña actualizada con éxito!");
      router.push("/campaigns");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteCampaign = async (e: React.MouseEvent<HTMLButtonElement>) => {
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
        throw new Error(errorData.error || "Error al ejecutar la campaña");
      }

      toast.success("¡Ejecución de campaña iniciada!");
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
        submitButtonText="Guardar"
      />
      <Button
        onClick={handleExecuteCampaign}
        disabled={isExecuting || isLoading || !campaign.enabled}
        className="w-full"
      >
        {isExecuting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Ejecutar campaña ahora
      </Button>
    </div>
  );
}
