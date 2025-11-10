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
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Import toast

interface Contact {
  id: string;
  name: string;
  phone: string;
}

const mockContacts: Contact[] = [
  { id: "c1", name: "Alice Smith", phone: "+11234567890" },
  { id: "c2", name: "Bob Johnson", phone: "+19876543210" },
  { id: "c3", name: "Charlie Brown", phone: "+15551234567" },
  { id: "c4", name: "Diana Prince", phone: "+12223334444" },
  { id: "c5", name: "Eve Adams", phone: "+17778889999" },
];

// Mock function to simulate fetching audience details
const fetchAudienceDetails = (id: string) => {
  // In a real app, this would fetch from an API
  const audiences = [
    { id: "1", name: "Marketing Leads", description: "..." },
    { id: "2", name: "Existing Customers", description: "..." },
    { id: "3", name: "Website Visitors", description: "..." },
  ];
  return audiences.find((aud) => aud.id === id);
};

// Mock function to simulate fetching audience members
const fetchAudienceMembers = (audienceId: string): string[] => {
  // In a real app, this would fetch from an API
  // For now, let's randomly assign some contacts to audience 1
  if (audienceId === "1") {
    return ["c1", "c3"];
  }
  return [];
};

export default function AudienceMembersPage() {
  const params = useParams();
  const audienceId = params.id as string;
  const router = useRouter();

  const [audienceName, setAudienceName] = useState("Loading...");
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const audience = fetchAudienceDetails(audienceId);
    if (audience) {
      setAudienceName(audience.name);
    } else {
      setAudienceName("Audience Not Found");
    }

    const members = fetchAudienceMembers(audienceId);
    setSelectedContactIds(new Set(members));
  }, [audienceId]);

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

  const handleSaveMembers = () => {
    // In a real application, you would send selectedContactIds to your backend
    console.log(
      `Saving members for audience ${audienceId}:`,
      Array.from(selectedContactIds)
    );
    toast.success(`Members for "${audienceName}" saved!`); // Use toast instead of alert
    router.push("/audiences"); // Navigate back to audiences page
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedContactIds.size === mockContacts.length && mockContacts.length > 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedContactIds(new Set(mockContacts.map(c => c.id)));
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
            {mockContacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedContactIds.has(contact.id)}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(contact.id, checked as boolean)
                    }
                  />
                </TableCell>
                <TableCell className="font-medium">{contact.name}</TableCell>
                <TableCell>{contact.phone}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSaveMembers}>Save Members</Button>
      </div>
    </div>
  );
}
