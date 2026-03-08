import { IContact } from "@/Nenichat/Contacts/domain/IContact";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { EditContactForm } from "../forms/EditContactForm";

interface EditContactDialogContentProps {
    contact: IContact;
    onSubmitSuccess: () => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isGroup?: boolean;
}

export function EditContactDialog({ contact, onSubmitSuccess, open, onOpenChange, isGroup }: EditContactDialogContentProps) {
    const handleSubmitSuccess = () => {
        onSubmitSuccess();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isGroup ? "Editar nombre del grupo" : "Editar nombre del contacto"}</DialogTitle>
                    <DialogDescription>
                        {isGroup ? "Actualiza el nombre del grupo." : "Actualiza el nombre del contacto."}
                    </DialogDescription>
                </DialogHeader>
                <EditContactForm contact={contact} onSubmitSuccess={handleSubmitSuccess} />
            </DialogContent>
        </Dialog>
    )
}
