"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { IContact } from '@/Nenichat/Contacts/domain/IContact';
import { IAudience } from '@/dto/IAudience';
import { AudienceForm } from "@/components/forms/AudienceForm";
import { ContactsTable } from "@/components/contacts-table";

const fetchAudienceDetails = async (id: string) => {
  const response = await fetch(`/api/audiences/${id}`);
  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error("Failed to fetch audience details");
  }
  const data = await response.json();
  return data as IAudience;
};

const fetchAudienceMembers = async (audienceId: string) => {
  const response = await fetch(`/api/audiences/${audienceId}/members`);
  if (!response.ok) {
    throw new Error("Failed to fetch audience members");
  }
  const data = await response.json();
  return {
    audienceMembers: data.audienceMembers as IContact[],
    // We don't need allContacts anymore as ContactsTable fetches them
  };
};

export default function AudienceMembersPage() {
  const params = useParams();
  const audienceId = params.id as string;
  const router = useRouter();

  const [audience, setAudience] = useState<IAudience | null>(null);
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());
  const [initialSelectedContactIds, setInitialSelectedContactIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchMembersAndAudience = async () => {
    setIsLoading(true);
    try {
      const audienceData = await fetchAudienceDetails(audienceId);
      if (audienceData) {
        setAudience(audienceData);
      }

      const { audienceMembers } = await fetchAudienceMembers(audienceId);
      const initialIds = new Set(audienceMembers.map(c => c.id?.toString() || ''));
      setSelectedContactIds(initialIds);
      setInitialSelectedContactIds(new Set(initialIds));
    } catch (error) {
      console.error("Failed to fetch audience details or members:", error);
      toast.error("Failed to load audience details or members.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembersAndAudience();
  }, [audienceId]);

  const handleEditAudience = async (name: string, description: string) => {
    if (!audience) return;

    try {
      const response = await fetch(`/api/audiences/${audience.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description }),
      });
      if (!response.ok) {
        throw new Error("Failed to update audience");
      }
      setIsEditDialogOpen(false);
      toast.success(`Audience "${name}" updated!`);
      fetchMembersAndAudience(); // Refresh the data
    } catch (error) {
      console.error("Error updating audience:", error);
      toast.error("Failed to update audience.");
    }
  };

  const hasChanges =
    selectedContactIds.size !== initialSelectedContactIds.size ||
    ![...selectedContactIds].every((id) => initialSelectedContactIds.has(id));

  const handleSaveMembers = async () => {
    try {
      const response = await fetch(`/api/audiences/${audienceId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contactIds: Array.from(selectedContactIds) }),
      });

      if (!response.ok) {
        throw new Error("Failed to save audience members");
      }

      toast.success(`Members for "${audience?.name}" saved!`);
      router.push("/audiences");
    } catch (error) {
      console.error("Error saving audience members:", error);
      toast.error("Failed to save audience members.");
    }
  };

  if (isLoading) {
    return (
      <Spinner className="h-5 w-5" />
    )
  }

  return (
    <div className="container mx-auto flex-1 space-y-4 px-4 md:p-8 md:pt-4  h-[calc(100vh-2rem)] flex flex-col">
      <div className="flex-col md:flex-row items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Manage Members for: {audience?.name || 'Loading...'}
        </h2>
        <div className="flex justify-end md:justify-start mt-4 space-x-1">
          <Button onClick={handleSaveMembers} disabled={!hasChanges}>Save Members</Button>
          <Button onClick={() => setIsEditDialogOpen(true)}>
            Edit Audience
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Spinner className="h-5 w-5" />
      ) : (
        <>

          <ContactsTable
            endpoint="/api/contacts"
            enableSelection={true}
            selectedIds={Array.from(selectedContactIds)}
            onSelectionChange={(ids) => setSelectedContactIds(new Set(ids))}
          />

        </>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Audience</DialogTitle>
            <DialogDescription>
              Make changes to your audience here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {audience && (
            <AudienceForm
              initialData={{
                name: audience.name,
                description: audience.description || '',
              }}
              onSubmit={handleEditAudience}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}