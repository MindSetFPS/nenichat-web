import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CreateOrderButton() {
    return (
        <Link href="/orders/new">
            <Button variant={"secondary"} size={"sm"}>
                <Plus className="mr-2 h-4 w-4" />
                New Order
            </Button>
        </Link>
    )
}