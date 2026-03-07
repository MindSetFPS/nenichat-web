'use client';

import { useEffect } from 'react';
import { IContact } from '@/Nenichat/Contacts/domain/IContact';
import { useContactStore } from '@/stores/contact-store';

interface ContactInitializerProps {
    contacts: IContact[];
    children: React.ReactNode;
}

export function ContactInitializer({ contacts, children }: ContactInitializerProps) {
    const setContacts = useContactStore((state) => state.setContacts);

    useEffect(() => {
        if (contacts.length > 0) {
            console.log(`[CONTACT_INIT] Hydrating store with ${contacts.length} contacts`);
            setContacts(contacts);
        }
    }, [contacts, setContacts]);

    return <>{children}</>;
}
