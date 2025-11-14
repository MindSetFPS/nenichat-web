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

export function CreateCampaignDialog() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (data: {
    name: string;
    description: string;
    message: string;
    run_at?: Date;
    audienceIds?: number[];
  }) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          message: data.message,
          run_at: data.run_at,
          audienceIds: data.audienceIds,
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
        <Button>Create Campaign</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>
            Fill in the details for your new campaign.
          </DialogDescription>
        </DialogHeader>
        <CampaignForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitButtonText="Create Campaign"
        />
      </DialogContent>
    </Dialog>
  );
}

