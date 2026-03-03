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
    const handleSubmitSuccess = () => {
        onSubmitSuccess();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar nombre del contacto</DialogTitle>
                    <DialogDescription>
                        Actualiza el nombre del contacto.
                    </DialogDescription>
                </DialogHeader>
                <EditContactForm contact={contact} onSubmitSuccess={handleSubmitSuccess} />
            </DialogContent>
        </Dialog>
    )
}
