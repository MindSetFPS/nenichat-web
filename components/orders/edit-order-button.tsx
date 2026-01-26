import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import Link from "next/link";

interface EditOrderButtonProps {
    orderId: number;
}

export function EditOrderButton({ orderId }: EditOrderButtonProps) {
    return (
        <Link href={`/orders/${orderId}/edit`}>
            <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4 mr-2" />
                Edit Order
            </Button>
        </Link>
    );
}
