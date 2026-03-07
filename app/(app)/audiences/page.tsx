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
import { PageHeader } from "@/components/ui/page-header";

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
        throw new Error("Error al crear la audiencia");
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
        throw new Error("Error al eliminar la audiencia");
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

  const createAudienceButton = <Button onClick={() => setIsCreateDialogOpen(true)}>Crear audiencia</Button>

  if (audiences.length === 0) {
    return (
      <>
        <PageHeader />
        <EmptyList
          action={createAudienceButton}
          description="Comienza a construir tus audiencias creando tu primera audiencia."
          title="No se encontraron audiencias"
          icon={<MailIcon className="w-16 h-16 text-primary" strokeWidth={1.5} />} />
      </>
    )
  }

  return (
    <>
      <PageHeader title="Audiencias">
        {audiences.length > 0 && createAudienceButton}
      </PageHeader>

      <AudiencesTable
        audiences={audiences}
        onDeleteClick={(audience) => {
          setSelectedAudience(audience);
          setIsDeleteDialogOpen(true);
        }}
      />
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

