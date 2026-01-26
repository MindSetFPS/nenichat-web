"use client"

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Contact } from "@/Nenichat/Contacts/domain/Contact";
import { useEffect, useState } from "react";

interface HideContactDialogContentProps {
    contact: Contact;
    onSubmitSuccess: () => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function HideContactDialogContent({ contact, onSubmitSuccess, open, onOpenChange }: HideContactDialogContentProps) {

    const [isHidden, setIsHidden] = useState(false)
    useEffect(() => {
        isContactHidden().then(setIsHidden)
    }, [])

    async function hideContact() {
        const res = await fetch(`/api/contacts/${contact.id}/hide`, {
            method: 'POST',
        })
        if (res.ok) {
            onSubmitSuccess()
            onOpenChange(false)
        } else {
            console.error('Error hiding contact')
        }
    }

    async function isContactHidden() {
        const res = await fetch(`/api/contacts/${contact.id}/hide`, {
            method: 'GET',
        })
        if (res.ok) {
            return true
        } else {
            return false
        }
    }

    async function unhideContact() {
        const res = await fetch(`/api/contacts/${contact.id}/hide`, {
            method: 'DELETE',
        })
        if (res.ok) {
            onSubmitSuccess()
            onOpenChange(false)
        } else {
            console.error('Error unhiding contact')
        }
    }

    function handleHideContact() {
        if (isHidden) {
            unhideContact()
        } else {
            hideContact()
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isHidden ? "Dejar de ignorar" : "Ignorar"}</DialogTitle>
                    <DialogDescription>
                        {isHidden ? "Este chat volverá a aparecer en tu lista de chats." : "Este chat dejará de aparecer en tu lista de chats, pero no se eliminará."}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button
                        variant={isHidden ? "default" : "destructive"}
                        onClick={handleHideContact}>
                        {isHidden ? "Dejar de ignorar" : "Ignorar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}