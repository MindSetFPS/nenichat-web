"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner"; // Import Spinner

import { IContact } from '@/repository/IContact';
import { IAudience } from '@/dto/IAudience';

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
    allContacts: data.allContacts as IContact[],
  };
};

export default function AudienceMembersPage() {
  const params = useParams();
  const audienceId = params.id as string;
  const router = useRouter();

  const [audienceName, setAudienceName] = useState("Loading...");
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());
  const [initialSelectedContactIds, setInitialSelectedContactIds] = useState<Set<string>>(new Set());
  const [allContacts, setAllContacts] = useState<IContact[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchMembersAndContacts = async () => {
      setIsLoading(true); // Set loading to true
      try {
        const audience = await fetchAudienceDetails(audienceId);
        if (audience) {
          setAudienceName(audience.name);
        } else {
          setAudienceName("Audience Not Found");
        }

        const { audienceMembers, allContacts } = await fetchAudienceMembers(audienceId);
        const initialIds = new Set(audienceMembers.map(c => c.id?.toString() || ''));
        setSelectedContactIds(initialIds);
        setInitialSelectedContactIds(new Set(initialIds)); // Store a copy for comparison
        setAllContacts(allContacts);
      } catch (error) {
        console.error("Failed to fetch audience details, members or all contacts:", error);
        toast.error("Failed to load audience details, members or contacts.");
      } finally {
        setIsLoading(false); // Set loading to false
      }
    };

    fetchMembersAndContacts();
  }, [audienceId]);

  const hasChanges =
    selectedContactIds.size !== initialSelectedContactIds.size ||
    ![...selectedContactIds].every((id) => initialSelectedContactIds.has(id));

  const handleCheckboxChange = (contactId: string, isChecked: boolean) => {
    setSelectedContactIds((prev) => {
      const newSet = new Set(prev);
      if (isChecked) {
        newSet.add(contactId);
      } else {
        newSet.delete(contactId);
      }
      return newSet;
    });
  };

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

      toast.success(`Members for "${audienceName}" saved!`);
      router.push("/audiences");
    } catch (error) {
      console.error("Error saving audience members:", error);
      toast.error("Failed to save audience members.");
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Manage Members for: {audienceName}
        </h2>
        <Button onClick={() => router.push("/audiences")}>
          Back to Audiences
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner className="h-5 w-5" />
        </div>
      ) : allContacts.length === 0 ? (
        <div className="flex justify-center items-center h-64 text-gray-500">
          No contacts available to add to this audience.
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedContactIds.size === allContacts.length && allContacts.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedContactIds(new Set(allContacts.map(c => c.id?.toString() || '')));
                        } else {
                          setSelectedContactIds(new Set());
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allContacts.map((contact) => (
                  <TableRow key={contact.id?.toString()}>
                    <TableCell>
                      <Checkbox
                        checked={selectedContactIds.has(contact.id?.toString() || '')}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange(contact.id?.toString() || '', checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium">{contact.contact_name || contact.pushname || contact.username || contact.phone_number}</TableCell>
                    <TableCell>{contact.phone_number}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveMembers} disabled={!hasChanges}>Save Members</Button>
          </div>
        </>
      )}
    </div>
  );
}
