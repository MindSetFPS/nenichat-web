import { Button } from "../ui/button";
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { deleteOrder } from "@/Nenichat/Orders/app/delete-order-client";
import { useRouter } from "next/navigation";

interface DeleteOrderDialogContentProps {
    orderId: number;
}

export function DeleteOrderDialogContent({ orderId }: DeleteOrderDialogContentProps) {
    const router = useRouter();
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Eliminar Orden</DialogTitle>
                <DialogDescription>
                    ¿Estás seguro de que quieres eliminar esta orden?
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
    )
}