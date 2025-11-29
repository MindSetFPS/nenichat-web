"use client"

import { useState } from "react"
import { MoreHorizontalIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { EditContactForm } from "../forms/EditContactForm"
import { IContact } from "@/Nenichat/Contacts/domain/IContact"
import { useRouter } from "next/navigation"
import { AssignToAudienceDialogContent } from "../assign-to-audience-dialog-content"

interface ChatDropDownDialogProps {
    contact: IContact;
}

interface EditContactDialogContentProps {
    contact: IContact;
    onSubmitSuccess: () => void;
}


function EditContactDialogContent({ contact, onSubmitSuccess }: EditContactDialogContentProps) {
    return (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Editar contacto</DialogTitle>
                <DialogDescription>
                    Actualiza la informacion del contacto.
                </DialogDescription>
            </DialogHeader>
            <EditContactForm contact={contact} onSubmitSuccess={onSubmitSuccess} />
        </DialogContent>
    )
}

export function ChatDropDownDialog({ contact }: ChatDropDownDialogProps) {
    const [showNewDialog, setShowNewDialog] = useState(false)
    const [showAssignToAudienceDialog, setShowAssignToAudienceDialog] = useState(false)
    const router = useRouter()

    const onSubmitSuccess = () => {
        setShowNewDialog(false)
        router.refresh()
    }

    return (
        <>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" aria-label="Open menu" size="icon-sm">
                        <MoreHorizontalIcon />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40" align="end">
                    <DropdownMenuGroup>
                        <DropdownMenuItem onSelect={() => setShowNewDialog(true)}>
                            Editar contacto
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setShowAssignToAudienceDialog(true)}>
                            Asignar a audiencia
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
                <EditContactDialogContent contact={contact} onSubmitSuccess={onSubmitSuccess} />
            </Dialog>
            <AssignToAudienceDialogContent
                contact={contact}
                onSubmitSuccess={onSubmitSuccess}
                open={showAssignToAudienceDialog}
                onOpenChange={setShowAssignToAudienceDialog}
            />
        </>
    )
}
