"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogTrigger,
} from "@/components/ui/dialog"
import { DeleteOrderDialogContent } from "./delete-order-dialog-content";

interface DeleteOrderButtonProps {
    orderId: number;
}

export function DeleteOrderButton({ orderId }: DeleteOrderButtonProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Order
                </Button>
            </DialogTrigger>
            <DeleteOrderDialogContent orderId={orderId} />
        </Dialog>
    );
}
