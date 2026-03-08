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
    isGroup?: boolean;
}

export function ChatDropDownDialog({ contact, isGroup }: ChatDropDownDialogProps) {
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
                            {isGroup ? "Editar grupo" : "Editar contacto"}
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem onSelect={() => setShowAssignToAudienceDialog(true)}>
                            Asignar a audiencia
                        </DropdownMenuItem> */}
                        {contact.id && (
                            <DropdownMenuItem onSelect={() => setShowIgnoreDialog(true)}>
                                {isGroup ? "Ignorar grupo" : "Ignorar contacto"}
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

            <EditContactDialog
                contact={contact}
                onSubmitSuccess={onSubmitSuccess}
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                isGroup={isGroup}
            />
            {/* <AssignToAudienceDialogContent
                contact={contact}
                onSubmitSuccess={onSubmitSuccess}
                open={showAssignToAudienceDialog}
                onOpenChange={setShowAssignToAudienceDialog}
            /> */}
            <HideContactDialogContent
                contact={contact}
                onSubmitSuccess={onSubmitSuccess}
                open={showIgnoreDialog}
                onOpenChange={setShowIgnoreDialog}
            />
        </>
    )
}
