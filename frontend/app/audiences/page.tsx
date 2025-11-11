"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { IAudience } from "@/dto/IAudience";

export default function AudiencesPage() {
  const [audiences, setAudiences] = useState<IAudience[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState<IAudience | null>(null);
  const router = useRouter(); // Initialize useRouter

  const fetchAudiences = async () => {
    try {
      const response = await fetch("/api/audiences");
      if (!response.ok) {
        throw new Error("Failed to fetch audiences");
      }
      const data: IAudience[] = await response.json();
      setAudiences(data);
    } catch (error) {
      console.error("Error fetching audiences:", error);
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

  const handleEditAudience = async (id: number, name: string, description: string) => {
    try {
      const response = await fetch(`/api/audiences/${id}`, {
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
      setSelectedAudience(null);
      fetchAudiences(); // Refresh the list
    } catch (error) {
      console.error("Error updating audience:", error);
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

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Audiences</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          Create Audience
        </Button>
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
            {audiences.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                      />
                    </svg>
                    <p className="mt-4 text-lg text-gray-600">
                      No audiences found.
                    </p>
                    <p className="text-sm text-gray-500">
                      Click "Create Audience" to add your first one.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              audiences.map((audience) => (
                <TableRow
                  key={audience.id}
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
                            setIsEditDialogOpen(true);
                          }}
                        >
                          Edit
                        </DropdownMenuItem>
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
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Audience Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Audience</DialogTitle>
            <DialogDescription>
              Create a new audience to group your contacts.
            </DialogDescription>
          </DialogHeader>
          <AudienceForm
            onSubmit={handleCreateAudience}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Audience Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Audience</DialogTitle>
            <DialogDescription>
              Make changes to your audience here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {selectedAudience && (
            <AudienceForm
              initialData={{
                name: selectedAudience.name,
                description: selectedAudience.description,
              }}
              onSubmit={(name, description) =>
                handleEditAudience(selectedAudience.id, name, description)
              }
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Audience Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Audience</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this audience? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => selectedAudience && handleDeleteAudience(selectedAudience.id)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface AudienceFormProps {
  initialData?: { name: string; description: string };
  onSubmit: (name: string, description: string) => void;
  onCancel: () => void;
}

function AudienceForm({ initialData, onSubmit, onCancel }: AudienceFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(name, description);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          Name
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="col-span-3"
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="description" className="text-right">
          Description
        </Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="col-span-3"
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save changes</Button>
      </DialogFooter>
    </form>
  );
}
