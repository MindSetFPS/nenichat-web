"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MailIcon, MoreHorizontal } from "lucide-react";
import { IAudience } from "@/Nenichat/Audiences/domain/IAudience";
import { Spinner } from "@/components/ui/spinner";
import { EmptyList } from "@/components/empty-list";
import { CreateAudienceDialog, DeleteAudienceDialog } from "@/components/audience-dialog";
import { PageHeader } from "@/components/ui/page-header";

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
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Audiences</h2>
            {createAudienceButton}
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {
                  audiences.map((audience) => (
                    <TableRow
                      key={Number(audience.id)}
                      className="cursor-pointer"
                      onClick={() => router.push(`/audiences/members/${audience.id}`)}
                    >
                      <TableCell className="font-medium">{audience.name}</TableCell>
                      <TableCell>{audience.description}</TableCell>
                      <TableCell>{new Date(audience.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent TableRow click from firing
                                setSelectedAudience(audience);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          </div>
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

