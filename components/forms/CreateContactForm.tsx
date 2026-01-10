"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ContactForm } from "./ContactForm";

export function CreateContactForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (data: {
        phone_number: string;
        contact_name: string;
    }) => {
        setIsLoading(true);

        try {
            const response = await fetch("/api/contacts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to create contact");
            }

            toast.success("Contact created successfully!");
            router.push("/contacts");
            router.refresh();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ContactForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitButtonText="Create Contact"
        />
    );
}
