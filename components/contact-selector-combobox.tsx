"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { IContact } from "@/Nenichat/Contacts/domain/IContact"
import { getContactDisplayName, getContactPhone } from "@/Nenichat/Contacts/app/get-contact-identifier"
import { normalizeContact, type ContactIdentifier } from "@/Nenichat/Contacts/app/contact-utils"
import { useContactStore } from "@/stores/contact-store"

/**
 * Represents any valid identifier for a contact.
 * Can be: database ID, LID (WhatsApp local ID), phone number, or full IContact object.
 * @example
 * // Valid values:
 * 123
 * "123"
 * "lid_001"
 * "+1234567890"
 * { id: 1, pushname: "John", ... }
 */

/**
 * Props for the ContactSelectorCombobox component
 */
interface ContactSelectorComboboxProps {
    /**
     * Array of contacts to display in the dropdown.
     * The component will filter these locally when user types.
     * @required
     */
    contacts: IContact[]

    /**
     * Whether contacts are currently being loaded.
     * Shows a loading spinner when true.
     * @default false
     */
    loading?: boolean

    /**
     * Callback fired when the search input changes.
     * Use this to fetch filtered contacts from an API.
     * The component also performs local filtering on the contacts array.
     * @param search - The current search string
     */
    onSearch?: (search: string) => void

    /**
     * Callback fired when a contact is selected.
     * Returns the full IContact object of the selected contact.
     * @param contact - The selected contact object
     */
    onSelectContact?: (contact: IContact) => void

    /**
     * Current value of the selector.
     * Can be set by: database ID (number), LID (string), phone number (string), or full IContact object.
     * The component will automatically find the matching contact from the contacts array.
     * @example
     * // Initialize by ID
     * value={123}
     * 
     * // Initialize by LID
     * value="lid_001"
     * 
     * // Initialize by phone
     * value="+1234567890"
     * 
     * // Initialize by contact object
     * value={contactObject}
     */
    value?: ContactIdentifier

    /**
     * Callback fired when the selected contact changes.
     * Use this for controlled mode to manage state externally.
     * @param contact - The new selected contact (or undefined if cleared)
     */
    onChange?: (contact: IContact | undefined) => void

    /**
     * Placeholder text shown when no contact is selected.
     * @default "Seleccionar contacto..."
     */
    placeholder?: string

    /**
     * Whether the component is disabled.
     * When disabled, the dropdown cannot be opened.
     * @default false
     */
    disabled?: boolean

    /**
     * Additional CSS classes to apply to the trigger button.
     */
    className?: string
}

/**
 * ContactSelectorCombobox - A searchable contact selection dropdown component.
 * 
 * Features:
 * - Local filtering as you type (activates with 2+ characters)
 * - Supports initialization by ID, LID, phone number, or full IContact object
 * - Can be used in controlled or uncontrolled mode
 * - Clear button to reset selection
 * - Displays contact name and phone number
 * 
 * @example
 * // Basic usage (uncontrolled)
 * const [selectedContact, setSelectedContact] = useState<IContact>()
 * 
 * return (
 *   <ContactSelectorCombobox
 *     contacts={contacts}
 *     onSearch={setSearchTerm}
 *     onSelectContact={setSelectedContact}
 *     placeholder="Selecciona un contacto..."
 *   />
 * )
 * 
 * @example
 * // Controlled mode with initial value
 * const [contact, setContact] = useState<IContact | undefined>(initialContact)
 * 
 * return (
 *   <ContactSelectorCombobox
 *     contacts={contacts}
 *     value={contact}
 *     onChange={setContact}
 *     onSearch={setSearchTerm}
 *   />
 * )
 * 
 * @example
 * // Initialize by different identifiers
 * <ContactSelectorCombobox contacts={contacts} value={123} />           // By ID
 * <ContactSelectorCombobox contacts={contacts} value="lid_001" />        // By LID
 * <ContactSelectorCombobox contacts={contacts} value="+1234567890" />    // By phone
 * <ContactSelectorCombobox contacts={contacts} value={contactObject} />   // By object
 */
export function ContactSelectorCombobox({
    contacts,
    loading = false,
    onSearch,
    onSelectContact,
    value: controlledValue,
    onChange,
    placeholder = "Seleccionar contacto...",
    disabled = false,
    className,
}: ContactSelectorComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [internalValue, setInternalValue] = React.useState<IContact | undefined>(undefined)
    const [searchTerm, setSearchTerm] = React.useState("")
    const [isSearchingStore, setIsSearchingStore] = React.useState(false)

    const { contactsByPhone, contactsByLid, fetchContact, getContact } = useContactStore()

    /**
     * Combined contacts from both props and store.
     */
    const allContacts = React.useMemo(() => {
        const contactMap = new Map<number, IContact>()

        // First add passed contacts
        for (const contact of contacts) {
            if (contact.id) {
                contactMap.set(contact.id, contact)
            }
        }

        // Then add store contacts (for ones not already added)
        for (const contact of contactsByPhone.values()) {
            if (contact.id && !contactMap.has(contact.id)) {
                contactMap.set(contact.id, contact)
            }
        }
        for (const contact of contactsByLid.values()) {
            if (contact.id && !contactMap.has(contact.id)) {
                contactMap.set(contact.id, contact)
            }
        }

        return [...contactMap.values()]
    }, [contacts, contactsByPhone, contactsByLid])

    /**
     * Filters contacts locally based on search term.
     * Activates when 2+ characters are typed.
     * Searches across: pushname, phone_number, lid, username, contact_name
     */
    const filteredContacts = React.useMemo(() => {
        if (!searchTerm || searchTerm.length < 2) return allContacts
        const lower = searchTerm.toLowerCase()
        return allContacts.filter(c =>
            c.pushname?.toLowerCase().includes(lower) ||
            c.phone_number?.toLowerCase().includes(lower) ||
            c.lid?.toLowerCase().includes(lower) ||
            c.username?.toLowerCase().includes(lower) ||
            c.contact_name?.toLowerCase().includes(lower)
        )
    }, [allContacts, searchTerm])

    /**
     * Updates both local search term and calls onSearch callback.
     * Also tries to fetch contact from store if not found locally.
     */
    const handleSearchChange = React.useCallback((value: string) => {
        setSearchTerm(value)
        onSearch?.(value)

        // Try to fetch contact from store if not found and search term looks like a phone/lid
        if (value.length >= 8) {
            const existing = getContact(value)
            if (!existing) {
                setIsSearchingStore(true)
                fetchContact(value).finally(() => setIsSearchingStore(false))
            }
        }
    }, [onSearch, getContact, fetchContact])

    /**
     * Resolves the selected contact.
     * In controlled mode, uses value prop; otherwise uses internal state.
     */
    const selectedContact = React.useMemo(() => {
        if (controlledValue !== undefined) {
            return normalizeContact(allContacts, controlledValue)
        }
        return internalValue
    }, [controlledValue, internalValue, allContacts])

    /**
     * Sets value - either through onChange callback (controlled) or internal state.
     */
    const setValue = React.useCallback((contact: IContact | undefined) => {
        if (onChange) {
            onChange(contact)
        } else {
            setInternalValue(contact)
        }
    }, [onChange])

    /**
     * Clears the selected contact.
     */
    const handleClear = React.useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        setValue(undefined)
        onSelectContact?.(undefined as unknown as IContact)
    }, [setValue, onSelectContact])

    /**
     * Handles contact selection.
     */
    const handleSelect = React.useCallback((contact: IContact) => {
        setValue(contact)
        setOpen(false)
        onSelectContact?.(contact)
    }, [setValue, onSelectContact])

    return (
        <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        "w-full justify-between rounded-xl h-11 pr-8",
                        !selectedContact && "text-muted-foreground",
                        className
                    )}
                >
                    {selectedContact ? (
                        <span className="truncate flex items-center gap-2">
                            <span className="font-medium">{getContactDisplayName(selectedContact)}</span>
                            {getContactPhone(selectedContact) && (
                                <span className="text-xs text-muted-foreground font-normal">
                                    {getContactPhone(selectedContact)}
                                </span>
                            )}
                        </span>
                    ) : (
                        <span className="truncate">{placeholder}</span>
                    )}
                    {/* <div className="flex items-center gap-1 absolute right-2"> */}

                    {/* i dont think you would ever want to clear this field, you either leave it as is or select another contact */}

                    {/* {selectedContact && (
                                <X
                                    className="h-4 w-4 opacity-50 hover:opacity-100"
                                    onClick={handleClear}
                                />
                            )} */}
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                    {/* </div> */}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0 rounded-xl overflow-hidden shadow-2xl border-primary/20" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Buscar contacto..."
                        onValueChange={handleSearchChange}
                        className="h-12"
                    />
                    <CommandGroup className="max-h-[300px] overflow-y-auto">
                        {(loading || isSearchingStore) ? (
                            <CommandItem className="flex items-center justify-center py-6 text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Cargando...
                            </CommandItem>
                        ) : filteredContacts.length > 0 ? (
                            filteredContacts.map((contact, idx) => (
                                <CommandItem
                                    key={contact.id?.toString() ?? contact.lid ?? `contact-${idx}`}
                                    value={contact.id?.toString() ?? contact.lid ?? ''}
                                    onSelect={() => handleSelect(contact)}
                                    className="flex items-center gap-2 py-3 cursor-pointer"
                                >
                                    <Check
                                        className={cn(
                                            "h-4 w-4",
                                            selectedContact?.id === contact.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <span className="font-bold text-sm truncate">
                                            {contact.pushname || contact.contact_name || "Sin nombre"}
                                        </span>
                                        <span className="text-xs text-muted-foreground truncate">
                                            {contact.phone_number ?? contact.lid}
                                        </span>
                                    </div>
                                </CommandItem>
                            ))
                        ) : (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                {searchTerm.length >= 2 ? "No se encontraron contactos." : "Empieza a escribir para buscar..."}
                            </div>
                        )}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

export type { IContact, ContactSelectorComboboxProps }
