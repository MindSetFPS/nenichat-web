import { useEffect, useState } from "react";
import { IContact } from "@/Nenichat/Contacts/domain/IContact";
import { IAudience } from "@/Nenichat/Audiences/domain/IAudience";
import { AudiencesTable } from "./audiences/audiences-table";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { getAudiences } from "@/Nenichat/Audiences/app/get-audiences-from-api";
import { Button } from "@/components/ui/button";
import { getContactAudiences } from "@/Nenichat/Audiences/app/get-contact-audiences";
import { updateContactAudiences } from "@/Nenichat/Audiences/app/update-contact-audiences";

interface AssignToAudienceDialogContentProps {
    contact: IContact;
    onSubmitSuccess: () => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface AudienceUpdate {
    contact_id: string;
    audience_id: string;
    action: "add" | "remove";
}

export function AssignToAudienceDialogContent({ contact, onSubmitSuccess, open, onOpenChange }: AssignToAudienceDialogContentProps) {
    const [audiences, setAudiences] = useState<IAudience[]>([])
    const [clientCheckedAudiences, setClientCheckedAudiences] = useState<IAudience[]>([])
    const [serverContactAudiences, setServerContactAudiences] = useState<IAudience[]>([]) // these are the audiences the contact belongs to
    const [audienceUpdates, setAudienceUpdates] = useState<AudienceUpdate[]>([])

    const onSelectionChange = (audiences: IAudience[]) => {
        setClientCheckedAudiences(audiences)
    }

    // get all the audiences
    useEffect(() => {
        getAudiences().then((audiences) => {
            setAudiences(audiences || []);
        });
    }, []);

    // get aundiences the contact belongs to
    useEffect(() => {
        getContactAudiences(contact!.id!.toString()).then((audiences) => {
            setClientCheckedAudiences(audiences || []); // initial checked audiences, can be mutated
            setServerContactAudiences(audiences || []); // initial contact audiences, can't be mutated
        });
    }, []);

    const handleSubmit = () => {
        let updates: AudienceUpdate[] = [];

        // check every audience
        audiences.forEach((audience) => {

            // check if the audience is checked in the client at any moment
            let isInClient = clientCheckedAudiences.some((a) => String(a.id) === String(audience.id));

            // check if the audience was originally checked 
            let isInServer = serverContactAudiences.some((a) => String(a.id) === String(audience.id));

            // audience was originally unchecked, now it is checked
            if (isInClient && !isInServer) {
                updates.push({
                    contact_id: contact.id!.toString(),
                    audience_id: audience.id.toString(),
                    action: "add"
                })
            }

            // audience was originally checked, now it is unchecked
            if (!isInClient && isInServer) {
                updates.push({
                    contact_id: contact.id!.toString(),
                    audience_id: audience.id.toString(),
                    action: "remove"
                })
            }
        })

        // finally, update the contact audiences
        updateContactAudiences(contact.id!.toString(), updates.map((update) => update.audience_id))
        onSubmitSuccess()
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Asignar audiencia</DialogTitle>
                    <DialogDescription>
                        Asigna la audiencia al contacto.
                    </DialogDescription>
                </DialogHeader>
                <AudiencesTable
                    audiences={audiences}
                    onDeleteClick={() => { }}
                    showCheckboxes={true}
                    selectedAudiences={clientCheckedAudiences}
                    onSelectionChange={onSelectionChange}
                    showCreatedAt={false}
                    showActions={false}
                />
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button onClick={handleSubmit}>Guardar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}