"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MailIcon } from "lucide-react";
import { IAudience } from "@/Nenichat/Audiences/domain/IAudience";
import { Spinner } from "@/components/ui/spinner";
import { EmptyList } from "@/components/empty-list";
import { CreateAudienceDialog, DeleteAudienceDialog } from "@/components/audience-dialog";
import { PageHeader } from "@/components/ui/page-header";
import { AudiencesTable } from "@/components/audiences/audiences-table";

export default function AudiencesPage() {
  const [audiences, setAudiences] = useState<IAudience[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState<IAudience | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchAudiences = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/audiences");
      if (!response.ok) {
        throw new Error("Failed to fetch audiences");
      }
      const data: IAudience[] = await response.json();
      setAudiences(data);
    } catch (error) {
      console.error("Error fetching audiences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAudiences();
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
      fetchAudiences(); // Refresh the list
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
      fetchAudiences(); // Refresh the list
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
    <div className="flex-1 space-y-4 mx-4">
      <PageHeader content={<h1 className="text-2xl font-bold">Audiences</h1>} />

      {audiences.length === 0 ?

        <EmptyList
          action={createAudienceButton}
          description="Start building your product catalog by creating your first product. Add details, images, and pricing to get started."
          title="No audiences found"
          icon={<MailIcon className="w-16 h-16 text-primary" strokeWidth={1.5} />} />
        :
        <>
          {createAudienceButton}
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
    </div>
  );
}

