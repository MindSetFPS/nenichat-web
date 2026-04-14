"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ContactForm } from "./contact-form";
import { IContact } from "@/Nenichat/Contacts/domain/IContact";
import { useContactStore } from "@/stores/contact-store";

interface EditContactFormProps {
    contact: IContact;
    onSubmitSuccess: () => void;
}

export function EditContactForm({ contact, onSubmitSuccess }: EditContactFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { setContact } = useContactStore();

    const handleSubmit = async (data: {
        phone_number: string;
        contact_name: string;
    }) => {
        setIsLoading(true);

        try {
            const response = await fetch(`/api/contacts/${contact.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ contact_name: data.contact_name }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update contact");
            }

            const updatedContact: IContact = await response.json();
            setContact(updatedContact);

            toast.success("Contact updated successfully!");
            onSubmitSuccess();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ContactForm
            onSubmit={handleSubmit}
            initialData={contact}
            isLoading={isLoading}
            submitButtonText="Guardar cambios"
        />
    );
}
