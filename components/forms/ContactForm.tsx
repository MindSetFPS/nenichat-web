"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IContact } from "@/Nenichat/Contacts/domain/IContact";

interface ContactFormProps {
    onSubmit: (data: {
        phone_number: string;
        contact_name: string;
    }) => Promise<void>;
    initialData?: Partial<IContact>;
    isLoading: boolean;
    submitButtonText: string;
}

export function ContactForm({
    onSubmit,
    initialData,
    isLoading,
    submitButtonText,
}: ContactFormProps) {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [contactName, setContactName] = useState("");

    useEffect(() => {
        if (initialData) {
            setPhoneNumber(initialData.phone_number || "");
            setContactName(initialData.contact_name || "");
        } else {
            setPhoneNumber("");
            setContactName("");
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit({
            phone_number: phoneNumber,
            contact_name: contactName,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contact_name" className="text-right">
                    Name
                </Label>
                <Input
                    id="contact_name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="col-span-3"
                    disabled={isLoading}
                />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone_number" className="text-right">
                    Phone
                </Label>
                <Input
                    id="phone_number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="col-span-3"
                    disabled={true}
                />
            </div>
            <Button type="submit" disabled={isLoading}>
                {submitButtonText}
            </Button>
        </form>
    );
}
