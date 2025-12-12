"use client"

import { useState } from "react"
import { MoreVerticalIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IContact } from "@/Nenichat/Contacts/domain/IContact"
import { useRouter } from "next/navigation"
import { AssignToAudienceDialogContent } from "../assign-to-audience-dialog-content"
import { HideContactDialogContent } from "./hide-contact-diaog"
import { EditContactDialog } from "./edit-contact-dialog"

interface ChatDropDownDialogProps {
    contact: IContact;
}

export function ChatDropDownDialog({ contact }: ChatDropDownDialogProps) {
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [showAssignToAudienceDialog, setShowAssignToAudienceDialog] = useState(false)
    const [showIgnoreDialog, setShowIgnoreDialog] = useState(false)
    const router = useRouter()

    const onSubmitSuccess = () => {
        setShowAssignToAudienceDialog(false)
        setShowIgnoreDialog(false)
        router.refresh()
    }

    return (
        <>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" aria-label="Open menu" size="icon-sm">
                        <MoreVerticalIcon />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40" align="end">
                    <DropdownMenuGroup>
                        <DropdownMenuItem onSelect={() => setShowEditDialog(true)}>
                            Editar contacto
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setShowAssignToAudienceDialog(true)}>
                            Asignar a audiencia
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setShowIgnoreDialog(true)}>
                            Ignorar contacto
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <EditContactDialog
                contact={contact}
                onSubmitSuccess={onSubmitSuccess}
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
            />
            <AssignToAudienceDialogContent
                contact={contact}
                onSubmitSuccess={onSubmitSuccess}
                open={showAssignToAudienceDialog}
                onOpenChange={setShowAssignToAudienceDialog}
            />
            <HideContactDialogContent
                contact={contact}
                onSubmitSuccess={onSubmitSuccess}
                open={showIgnoreDialog}
                onOpenChange={setShowIgnoreDialog}
            />
        </>
    )
}
