'use client'

import Link from "next/link"
import { useContactStore } from "@/stores/contact-store"
import { getContactName } from "@/Nenichat/Contacts/app/get-contact-name"

interface ContactNameCellProps {
    contactId: number | null
}

export function ContactNameCell({ contactId }: ContactNameCellProps) {
    const getContactById = useContactStore((state) => state.getContactById)
    
    if (!contactId) {
        return <span className="text-xs">#{contactId}</span>
    }

    const contact = getContactById(contactId)
    const displayName = getContactName(contact) || `#${contactId}`

    return (
        <Link href={`/contacts/${contactId}`}
            className="hover:underline text-blue-400 w-min text-xs md:text-sm font-medium"
            onClick={(e) => e.stopPropagation()}
        >
            {displayName}
        </Link>
    )
}
