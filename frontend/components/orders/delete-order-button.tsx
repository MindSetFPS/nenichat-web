import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteOrderButtonProps {
    orderId: number;
}

export function DeleteOrderButton({ orderId }: DeleteOrderButtonProps) {
    return (
        <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Order
        </Button>
    );
}
