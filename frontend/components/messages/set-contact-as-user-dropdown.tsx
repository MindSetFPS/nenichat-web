"use client"

import { useState } from "react"
import { MoreHorizontalIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
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
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IContact } from "@/Nenichat/Contacts/domain/IContact"
import { useRouter } from "next/navigation"

interface SetContactAsUserDropdownProps {
    contact: IContact;
}

export function SetContactAsUserDropdown({ contact }: SetContactAsUserDropdownProps) {
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const router = useRouter()

    const handleAccept = async () => {
        try {
            const response = await fetch("/api/profile/set-user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId: contact.id }),
            })

            if (response.ok) {
                router.push("/profile")
                setShowConfirmDialog(false)
            } else {
                const errorData = await response.json()
                console.error("Failed to set contact as user:", errorData)
            }
        } catch (error) {
            console.error("Network error or unexpected issue:", error)
        }
    }

    return (
        <>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontalIcon className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                        <DropdownMenuItem onSelect={() => setShowConfirmDialog(true)}>
                            Set this contact as your user
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Set as User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to set this contact as your user?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAccept}>
                            Accept
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
