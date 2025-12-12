import { IContact } from "@/Nenichat/Contacts/domain/IContact";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { EditContactForm } from "../forms/EditContactForm";

interface EditContactDialogContentProps {
    contact: IContact;
    onSubmitSuccess: () => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditContactDialog({ contact, onSubmitSuccess, open, onOpenChange }: EditContactDialogContentProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar contacto</DialogTitle>
                    <DialogDescription>
                        Actualiza la informacion del contacto.
                    </DialogDescription>
                </DialogHeader>
                <EditContactForm contact={contact} onSubmitSuccess={onSubmitSuccess} />
            </DialogContent>
        </Dialog>
    )
}
