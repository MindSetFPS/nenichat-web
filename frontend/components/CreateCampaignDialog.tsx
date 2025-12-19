"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CampaignForm } from "./forms/CampaignForm";
import { NewCampaignData } from "@/Nenichat/Campaigns/domain/new-campaign-dto";

export function CreateCampaignDialog() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleSubmit({
    name,
    description,
    message,
    runAt,
    interval,
    dayOfMonth,
    frequency_type,
    dayOfWeek,
    audienceIds,
  }: NewCampaignData) {
    setIsLoading(true);

    console.log({
      name,
      description,
      message,
      runAt,
      interval,
      dayOfMonth,
      frequency_type,
      dayOfWeek,
      audienceIds,
    });

    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          message,
          runAt,
          interval,
          dayOfMonth,
          frequency_type,
          dayOfWeek,
          audienceIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create campaign");
      }

      toast.success("Campaign created successfully!");
      setOpen(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Crear campaña</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear nueva campaña</DialogTitle>
          <DialogDescription>
            Programa mensajes para envíar una vez o repetidamente a tus contactos.
          </DialogDescription>
        </DialogHeader>
        <CampaignForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitButtonText="Crear campaña"
        />
      </DialogContent>
    </Dialog>
  );
}

