"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
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

interface ProfileSelectorComboboxProps {
    contacts: IContact[];
    loading: boolean;
    onSearch: (search: string) => void;
    onSelectContact: (contactId: string) => void;
}

/**
 * @function ProfileSelectorCombobox
 * @description A combobox component to search and select contacts to link to a profile.
 */
export function ProfileSelectorCombobox({ contacts, loading, onSearch, onSelectContact }: ProfileSelectorComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState("")

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between rounded-xl h-11"
                >
                    <span className="truncate">
                        {value
                            ? contacts.find((contact) => contact.id?.toString() === value)?.pushname || "Seleccionar contacto..."
                            : "Seleccionar contacto..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0 rounded-xl overflow-hidden shadow-2xl border-primary/20" align="start">
                <Command shouldFilter={false}>
                    <CommandInput placeholder="Buscar contacto..." onValueChange={onSearch} className="h-12" />
                    <CommandEmpty>No se encontraron contactos.</CommandEmpty>
                    <CommandGroup className="max-h-[300px] overflow-y-auto">
                        {
                            loading ? (
                                <CommandItem className="flex items-center justify-center py-6 text-muted-foreground">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Cargando...
                                </CommandItem>
                            ) : (
                                contacts && contacts.length > 0 ? contacts.map((contact) => (
                                    <CommandItem
                                        key={contact.id?.toString()}
                                        value={contact.id?.toString()}
                                        onSelect={(currentValue) => {
                                            setValue(currentValue === value ? "" : currentValue)
                                            setOpen(false)
                                            onSelectContact(contact.id?.toString() || "")
                                        }}
                                        className="flex items-center gap-2 py-3 cursor-pointer"
                                    >
                                        <Check
                                            className={cn(
                                                "h-4 w-4",
                                                value === contact.id?.toString() ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">{contact.pushname || "Sin nombre"}</span>
                                            <span className="text-xs text-muted-foreground">{contact.phone_number || contact.lid}</span>
                                        </div>
                                    </CommandItem>
                                )) : (
                                    <div className="py-6 text-center text-sm text-muted-foreground">
                                        Empieza a escribir para buscar...
                                    </div>
                                )
                            )
                        }
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
