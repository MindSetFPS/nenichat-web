import Link from "next/link";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";

export default function CreateExpenseButton() {
    return (
        <Link href="/expenses/new">
            <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Gasto
            </Button>
        </Link>
    )
}