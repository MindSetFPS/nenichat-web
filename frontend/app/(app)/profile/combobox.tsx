
"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

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
import { Loader2 } from "lucide-react"
interface ComboboxDemoProps {
  contacts: IContact[];
  loading: boolean;
  onSearch: (search: string) => void;
  onSelectContact: (contactId: string) => void;
}

export function ComboboxDemo({ contacts, loading, onSearch, onSelectContact }: ComboboxDemoProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? contacts.find((contact) => contact.id?.toString() === value)?.pushname || "Select contact..."
            : "Select contact..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search contact..." onValueChange={onSearch} />
          <CommandEmpty>No contact found.</CommandEmpty>
          <CommandGroup>
            {
              loading ? (
                <CommandItem>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
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
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === contact.id?.toString() ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {contact.pushname || contact.phone_number}
                  </CommandItem>
                )) : (
                  <CommandItem>
                    No contacts found.
                  </CommandItem>
                )
              )
            }
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
