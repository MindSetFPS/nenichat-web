"use client"

import { useState } from "react"
import Link from "next/link"
import { MoreVerticalIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DeleteOrderDialogContent } from "./delete-order-dialog-content"

interface DropdownMenuDialogProps {
    orderId: number;
    orderNumber: number;
}

export function DropdownMenuDialog({ orderId, orderNumber }: DropdownMenuDialogProps) {
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
                        <DropdownMenuItem>
                            <Link href={`/orders/${orderNumber}/edit`} className="w-full">
                                Editar orden
                            </Link>
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
