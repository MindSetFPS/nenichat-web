"use client";

import { useState, useEffect } from "react";
import { MailIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IAudience } from "@/Nenichat/Audiences/domain/IAudience";
import { Spinner } from "@/components/ui/spinner";
import { EmptyList } from "@/components/empty-list";
import { CreateAudienceDialog, DeleteAudienceDialog } from "@/components/audience-dialog";
import { AudiencesTable } from "@/components/audiences/audiences-table";
import { getAudiences } from "@/Nenichat/Audiences/app/get-audiences-from-api";

export default function AudiencesPage() {
  const [audiences, setAudiences] = useState<IAudience[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState<IAudience | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAudiences().then((audiences) => {
      setAudiences(audiences || []);
      setIsLoading(false);
    })
  }, []);

  const handleCreateAudience = async (name: string, description: string) => {
    try {
      const response = await fetch("/api/audiences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description }),
      });
      if (!response.ok) {
        throw new Error("Failed to create audience");
      }
      setIsCreateDialogOpen(false);
      getAudiences().then((audiences) => {
        setAudiences(audiences || []);
        setIsLoading(false);
      }) // Refresh the list
    } catch (error) {
      console.error("Error creating audience:", error);
    }
  };

  const handleDeleteAudience = async (id: number) => {
    try {
      const response = await fetch(`/api/audiences/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete audience");
      }
      setIsDeleteDialogOpen(false);
      setSelectedAudience(null);
      getAudiences().then((audiences) => {
        setAudiences(audiences || []);
        setIsLoading(false);
      }) // Refresh the list
    } catch (error) {
      console.error("Error deleting audience:", error);
    }
  };

  if (isLoading) {
    return (
      <Spinner className="h-5 w-5" />
    )
  }

  const createAudienceButton = <Button onClick={() => setIsCreateDialogOpen(true)}>Create Audience</Button>

  return (
    <>
      <h1 className="text-2xl font-bold">Audiences</h1>
      {audiences.length > 0 && createAudienceButton}

      {audiences.length === 0 ?
        <EmptyList
          action={createAudienceButton}
          description="Start building your audiences by creating your first audience."
          title="No audiences found"
          icon={<MailIcon className="w-16 h-16 text-primary" strokeWidth={1.5} />} />
        :
        <>
          <AudiencesTable
            audiences={audiences}
            onDeleteClick={(audience) => {
              setSelectedAudience(audience);
              setIsDeleteDialogOpen(true);
            }}
          />
        </>
      }
      <CreateAudienceDialog
        handleCreateAudience={handleCreateAudience}
        isCreateDialogOpen={isCreateDialogOpen}
        setIsCreateDialogOpen={setIsCreateDialogOpen} />

      <DeleteAudienceDialog
        handleDeleteAudience={handleDeleteAudience}
        isDeleteDialogOpen={isDeleteDialogOpen}
        selectedAudience={selectedAudience}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
      />
    </>
  );
}

