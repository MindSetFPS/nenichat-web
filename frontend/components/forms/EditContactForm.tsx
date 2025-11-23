"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ContactForm } from "./ContactForm";
import { IContact } from "@/Nenichat/Contacts/domain/IContact";

interface EditContactFormProps {
    contact: IContact;
    onSubmitSuccess: () => void;
}

export function EditContactForm({ contact, onSubmitSuccess }: EditContactFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

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
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to update contact");
            }

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
            submitButtonText="Save Changes"
        />
    );
}
