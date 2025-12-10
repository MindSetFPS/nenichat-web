"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog"

import { useRouter } from "next/navigation";

interface DeleteOrderButtonProps {
    orderId: number;
}

async function deleteOrder(orderId: number) {
    const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
    });

    if (!res.ok) {
        throw new Error("Failed to delete order");
    }
}

export function DeleteOrderButton({ orderId }: DeleteOrderButtonProps) {
    const router = useRouter();
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Order
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Order</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this order?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button
                            variant="destructive"
                            onClick={async () => {
                                await deleteOrder(orderId);
                                router.push("/orders");
                            }}>
                            Confirm
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
