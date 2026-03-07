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
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal } from "lucide-react";
import { IAudience } from "@/Nenichat/Audiences/domain/IAudience";

interface AudiencesTableProps {
    audiences: IAudience[];
    selectedAudiences?: IAudience[];
    showCheckboxes?: boolean;
    showCreatedAt?: boolean;
    showActions?: boolean;
    onSelectionChange?: (audiences: IAudience[]) => void;
    onDeleteClick: (audience: IAudience) => void;
}

export function AudiencesTable({
    audiences,
    onDeleteClick,
    showCheckboxes = false,
    selectedAudiences = [],
    onSelectionChange,
    showCreatedAt = true,
    showActions = true,
}: AudiencesTableProps) {
    const router = useRouter();

    const handleSelectAll = (checked: boolean) => {
        if (onSelectionChange) {
            if (checked) {
                onSelectionChange(audiences);
            } else {
                onSelectionChange([]);
            }
        }
    };

    /**
     * Handles the selection or deselection of a single audience row.
     * If `checked` is true, the audience is added to the `selectedAudiences`.
     * If `checked` is false, the audience is removed from the `selectedAudiences`.
     *
     * @param audience The audience object being selected or deselected.
     * @param checked A boolean indicating whether the audience is being checked (true) or unchecked (false).
     */
    const handleSelectRow = (audience: IAudience, checked: boolean) => {
        if (onSelectionChange) {
            if (checked) {
                onSelectionChange([...selectedAudiences, audience]);
            } else {
                let d = selectedAudiences.filter((a) => String(a.id) !== String(audience.id))
                console.log("filter", d)
                onSelectionChange(d);
            }
        }
    };

    return (
        <div className="rounded-md border overflow-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        {showCheckboxes && (
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={
                                        audiences.length > 0 &&
                                        selectedAudiences.length === audiences.length
                                    }
                                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                    aria-label="Select all"
                                />
                            </TableHead>
                        )}
                        <TableHead>Nombre</TableHead>
                        <TableHead>Descripción</TableHead>
                        {showCreatedAt && <TableHead>Creado el</TableHead>}
                        {showActions && <TableHead className="text-right">Acciones</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {audiences.map((audience) => (
                        <TableRow
                            key={Number(audience.id)}
                            className="cursor-pointer"
                            onClick={() => router.push(`/audiences/members/${audience.id}`)}
                        >
                            {showCheckboxes && (
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                    <Checkbox
                                        checked={selectedAudiences.some((a) => String(a.id) === String(audience.id))}
                                        onCheckedChange={(checked) =>
                                            handleSelectRow(audience, !!checked)
                                        }
                                        aria-label={`Select ${audience.name}`}
                                    />
                                </TableCell>
                            )}
                            <TableCell className="font-medium">{audience.name}</TableCell>
                            <TableCell>{audience.description}</TableCell>
                            {showCreatedAt && (
                                <TableCell>
                                    {new Date(audience.created_at).toLocaleDateString()}
                                </TableCell>
                            )}
                            {showActions && (
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Abrir menú</span>
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
                                                Eliminar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
