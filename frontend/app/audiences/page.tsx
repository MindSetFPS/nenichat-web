"use client";

import { useState } from "react";
import Link from "next/link"; // Import Link
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

interface Audience {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

const initialAudiences: Audience[] = [
  {
    id: "1",
    name: "Marketing Leads",
    description: "Potential customers from recent campaigns",
    createdAt: "2023-10-26",
  },
  {
    id: "2",
    name: "Existing Customers",
    description: "All customers who have made a purchase",
    createdAt: "2023-09-15",
  },
  {
    id: "3",
    name: "Website Visitors",
    description: "Users who visited the website in the last 30 days",
    createdAt: "2023-11-01",
  },
];

export default function AudiencesPage() {
  const [audiences, setAudiences] = useState<Audience[]>(initialAudiences);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState<Audience | null>(null);

  const handleCreateAudience = (name: string, description: string) => {
    const newAudience: Audience = {
      id: String(audiences.length + 1),
      name,
      description,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setAudiences([...audiences, newAudience]);
    setIsCreateDialogOpen(false);
  };

  const handleEditAudience = (id: string, name: string, description: string) => {
    setAudiences(
      audiences.map((aud) =>
        aud.id === id ? { ...aud, name, description } : aud
      )
    );
    setIsEditDialogOpen(false);
    setSelectedAudience(null);
  };

  const handleDeleteAudience = (id: string) => {
    setAudiences(audiences.filter((aud) => aud.id !== id));
    setIsDeleteDialogOpen(false);
    setSelectedAudience(null);
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
            {audiences.map((audience) => (
              <TableRow key={audience.id} className="cursor-pointer">
                <Link href={`/audiences/members/${audience.id}`} passHref className="contents">
                  <TableCell className="font-medium">{audience.name}</TableCell>
                  <TableCell>{audience.description}</TableCell>
                  <TableCell>{audience.createdAt}</TableCell>
                </Link>
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
                          e.stopPropagation(); // Prevent Link click from firing
                          setSelectedAudience(audience);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent Link click from firing
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
            ))}
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
