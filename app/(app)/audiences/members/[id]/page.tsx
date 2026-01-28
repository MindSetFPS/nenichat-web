"use client";

import { useState, useEffect, useRef } from "react";
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
import { IAudience } from '@/Nenichat/Audiences/domain/IAudience';
import { AudienceForm } from "@/components/forms/AudienceForm";
import updateAudienceMembers from "@/Nenichat/Audiences/app/update-audience-members-from-api";
import { DataTable } from "@/components/data-table";
import { columns } from "../../../../../components/audiences/columns";
import { Toggle } from "@/components/ui/toggle";
import { getAudienceDetails } from "@/Nenichat/Audiences/app/get-audience-details-from-api";
import { getAudienceMembers } from "@/Nenichat/Audiences/app/get-audience-members-from-api";
import { getAudienceUnselectedContacts } from "@/Nenichat/Audiences/app/get-audience-unselected-contacts";
import updateAudienceDetailsFromApi from "@/Nenichat/Audiences/app/update-audience-details-from-api";

export default function AudienceMembersPage() {
  const params = useParams();
  const audienceId = params.id as string;
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [audienceDetails, setAudienceDetails] = useState<IAudience | null>(null);

  const [audienceMembers, setAudienceMembers] = useState<IContact[]>([]);

  const [showSelectColumn, setShowSelectColumn] = useState(false);
  const [rowSelection, setRowSelection] = useState<{ [key: string]: boolean }>({});
  const [allContactsFetched, setAllContactsFetched] = useState(false); // to prevent fetching the contacts multiple times

  const [initialMembersIds, setInitialMembersIds] = useState<{ [key: string]: boolean }>({});
  const selectionInitialized = useRef(false);

  // const hasChanges = selectedContactIds.size !== initialSelectedContactIds.size || ![...selectedContactIds].every((id) => initialSelectedContactIds.has(id));

  // fetch audience and members on mount
  useEffect(() => {
    selectionInitialized.current = false;
    setInitialMembersIds({});
    fetchMembersAndAudience();
  }, [audienceId]);

  // takes a list of contacts and returns an object with the contact ids as keys and true as values
  function createInitialRowSelection(contactList: IContact[]) {
    return contactList.reduce((acc, member) => {
      if (member.id) {
        acc[String(member.id)] = true;
      }
      return acc;
    }, {} as { [key: string]: boolean });
  }

  // here im setting the wrong variable everytime i update the audience members
  const fetchMembersAndAudience = async () => {
    setIsLoading(true);
    try {
      const audienceDetails = await getAudienceDetails(audienceId);
      if (audienceDetails) setAudienceDetails(audienceDetails);
      let initialMembers = await getAudienceMembers(audienceId);
      setAudienceMembers(initialMembers);

      if (!selectionInitialized.current) {
        setInitialMembersIds(createInitialRowSelection(initialMembers));
        selectionInitialized.current = true;
      }
    } catch (error) {
      console.error("Failed to fetch audience details or members:", error);
      toast.error("Failed to load audience details or members.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAudienceDetails = async (name: string, description: string) => {
    if (!audienceDetails) return;

    try {
      let response = await updateAudienceDetailsFromApi(audienceId, name, description);
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

  const handleSaveMembers = async () => {
    try {
      const response = await updateAudienceMembers(rowSelection, audienceId);
      toast.success(`Members for "${audienceDetails?.name}" saved!`);
      router.push("/audiences");
    } catch (error) {
      console.error("Error saving audience members:", error);
      toast.error("Failed to save audience members.");
    }
  };

  async function onToggleChangeMembers() {
    setShowSelectColumn(!showSelectColumn);
    if (!allContactsFetched) {
      const contactsNotInAudience = await getAudienceUnselectedContacts(audienceId);
      setAllContactsFetched(true);
      setAudienceMembers([...audienceMembers, ...contactsNotInAudience]);
    }
    // if some rows are selected, but we hide the select column, the selected rows are still highlighted
    showSelectColumn ? setRowSelection({}) : setRowSelection(initialMembersIds);
  }

  return (
    <>
      {
        isLoading ? (
          <Spinner className="h-5 w-5" />
        ) : (
          <>
            <h1 className="text-2xl font-bold">Miembros de: {audienceDetails?.name || 'Loading...'}</h1>

            <div className="md:flex justify-end md:justify-start my-2 space-x-1">
              <Button onClick={handleSaveMembers} variant="secondary">Guardar cambios</Button>
              <Toggle variant="outline" onClick={onToggleChangeMembers}>
                Cambiar miembros
              </Toggle>
              <Button onClick={() => setIsEditDialogOpen(true)} variant="outline">
                Editar audiencia
              </Button>
            </div>

            <DataTable
              rowSelection={rowSelection}
              filterMode="global"
              onRowSelectionChange={setRowSelection}
              columns={columns}
              getRowId={(row) => String(row.id)}
              showSelectColumn={showSelectColumn}
              data={audienceMembers}
            />
          </>
        )
      }

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Audience</DialogTitle>
            <DialogDescription>
              Make changes to your audience here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {audienceDetails && (
            <AudienceForm
              initialData={{
                name: audienceDetails.name,
                description: audienceDetails.description || '',
              }}
              onSubmit={handleEditAudienceDetails}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}