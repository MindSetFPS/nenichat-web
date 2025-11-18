
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
import { IContact } from "@/repository/IContact"

interface ComboboxDemoProps {
  contacts: IContact[];
  onSearch: (search: string) => void;
  onSelectContact: (contactId: string) => void;
}

export function ComboboxDemo({ contacts, onSearch, onSelectContact }: ComboboxDemoProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")

  const [currentContacts, setCurrentContacts] = React.useState<IContact[]>(contacts)

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
            ? currentContacts.find((contact) => contact.id === value)?.pushname || "Select contact..."
            : "Select contact..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search contact..." onValueChange={onSearch} />
          <CommandEmpty>No contact found.</CommandEmpty>
          <CommandGroup>
            {currentContacts.map((contact) => (
              <CommandItem
                key={contact.id}
                value={contact.id}
                onSelect={(currentValue) => {
                  setValue(currentValue === value ? "" : currentValue)
                  setOpen(false)
                  onSelectContact(contact.id)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === contact.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {contact.pushname || contact.phone_number}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
