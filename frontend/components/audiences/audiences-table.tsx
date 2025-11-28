"use client";

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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { IAudience } from "@/Nenichat/Audiences/domain/IAudience";

interface AudiencesTableProps {
    audiences: IAudience[];
    onDeleteClick: (audience: IAudience) => void;
}

export function AudiencesTable({ audiences, onDeleteClick }: AudiencesTableProps) {
    const router = useRouter();

    return (
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
                        <TableRow
                            key={Number(audience.id)}
                            className="cursor-pointer"
                            onClick={() => router.push(`/audiences/members/${audience.id}`)}
                        >
                            <TableCell className="font-medium">{audience.name}</TableCell>
                            <TableCell>{audience.description}</TableCell>
                            <TableCell>
                                {new Date(audience.created_at).toLocaleDateString()}
                            </TableCell>
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
                                                onDeleteClick(audience);
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
    );
}
