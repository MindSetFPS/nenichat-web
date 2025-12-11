"use client"

import { useState } from "react"
import { MoreVerticalIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { DeleteOrderDialogContent } from "./delete-order-dialog-content"

interface DropdownMenuDialogProps {
    orderId: number;
}

export function DropdownMenuDialog({ orderId }: DropdownMenuDialogProps) {
    const [showNewDialog, setShowNewDialog] = useState(false)

    return (
        <>
            <DropdownMenu modal={false}>

                <DropdownMenuTrigger asChild>
                    <Button variant="outline" aria-label="Open menu" size="icon-sm">
                        <MoreVerticalIcon />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-40" align="end">
                    <DropdownMenuLabel>Opciones de orden</DropdownMenuLabel>
                    <DropdownMenuGroup>
                        <DropdownMenuItem >
                            Editar orden
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onSelect={() => setShowNewDialog(true)}
                            variant="destructive">Eliminar orden</DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
                <DeleteOrderDialogContent orderId={orderId} />
            </Dialog>
        </>
    )
}
