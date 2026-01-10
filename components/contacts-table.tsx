"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { IContact } from "@/Nenichat/Contacts/domain/IContact";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Pagination } from "./ui/pagination";
import { EmptyList } from "./empty-list";
import { UsersIcon } from "lucide-react";
import { Input } from "./ui/input";
import { getContactIdentifier } from "@/Nenichat/Contacts/app/get-contact-identifier";

interface IContactResponse {
    data: IContact[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

interface ContactsTableProps {
    endpoint: string;
    defaultColumnVisibility?: {
        id: boolean;
        name: boolean;
        phoneNumber: boolean;
        lid: boolean;
        username: boolean;
        pushname: boolean;
        createdAt: boolean;
    };
    headerActions?: React.ReactNode;
    refreshTrigger?: number;
    enableSelection?: boolean;
    selectedIds?: string[];
    onSelectionChange?: (selectedIds: string[]) => void;
}

/**
 * ContactsTable Component
 *
 * A reusable table component for displaying contacts with pagination, column visibility, and optional row selection.
 *
 * @param {string} endpoint - The API endpoint to fetch contacts from.
 * @param {Object} defaultColumnVisibility - Initial visibility state for columns.
 * @param {React.ReactNode} headerActions - Optional actions to render in the header (e.g., Sync button).
 * @param {number} refreshTrigger - A number that, when changed, triggers a refresh of the table data.
 * @param {boolean} enableSelection - Whether to show checkboxes for row selection.
 * @param {string[]} selectedIds - Optional array of selected IDs for controlled selection.
 * @param {function} onSelectionChange - Callback fired when a checkbock is clicked. Receives an array of selected contact IDs.
 */
export function ContactsTable({
    endpoint,
    defaultColumnVisibility = {
        id: true,
        name: true,
        phoneNumber: true,
        lid: true,
        username: true,
        pushname: true,
        createdAt: true,
    },
    headerActions,
    refreshTrigger = 0,
    enableSelection = false,
    selectedIds: controlledSelectedIds,
    onSelectionChange,
}: ContactsTableProps) {
    const [response, setResponse] = useState<IContactResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [columnVisibility, setColumnVisibility] = useState(defaultColumnVisibility);
    const [internalSelectedIds, setInternalSelectedIds] = useState<Set<string>>(new Set());
    const [contacts, setContacts] = useState<IContact[]>([]);

    const selectedIds = controlledSelectedIds ? new Set(controlledSelectedIds) : internalSelectedIds;

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const newSelected = new Set(selectedIds);
            contacts.forEach((contact) => newSelected.add(String(contact.id)));
            if (!controlledSelectedIds) setInternalSelectedIds(newSelected);
            onSelectionChange?.(Array.from(newSelected));
        } else {
            const newSelected = new Set(selectedIds);
            contacts.forEach((contact) => newSelected.delete(String(contact.id)));
            if (!controlledSelectedIds) setInternalSelectedIds(newSelected);
            onSelectionChange?.(Array.from(newSelected));
        }
    };

    const handleSelectOne = (checked: boolean, id: string) => {
        const newSelected = new Set(selectedIds);
        if (checked) {
            newSelected.add(id);
        } else {
            newSelected.delete(id);
        }
        if (!controlledSelectedIds) setInternalSelectedIds(newSelected);
        onSelectionChange?.(Array.from(newSelected));
    };

    const isAllSelected = contacts.length > 0 && contacts.every((contact) => selectedIds.has(String(contact.id)));
    const isSomeSelected = contacts.some((contact) => selectedIds.has(String(contact.id))) && !isAllSelected;

    const fetchContacts = async (page: number, size: number) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${endpoint}?page=${page}&pageSize=${size}`);
            if (!response.ok) {
                throw new Error("Failed to fetch contacts");
            }
            const data: IContactResponse = await response.json();
            setResponse(data);
            setContacts(data.data);
        } catch (error) {
            console.error("Error fetching contacts:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts(page, pageSize);
    }, [page, pageSize, endpoint, refreshTrigger]);

    function headerActionsComponent() {
        return (
            <div className="md:flex items-center w-full justify-between mb-0 space-y-2 space-x-2">
                <div className="flex gap-2 w-full">
                    <Input className="w-full min-w-40" type="text" placeholder="Search contacts" />
                    <Button className="w-auto">Seleccionar columna</Button>
                </div>
                {headerActions}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button className="p-2 mb-2 mr-2" variant="outline">
                            Columns
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuCheckboxItem
                            checked={columnVisibility.id}
                            onCheckedChange={(value) =>
                                setColumnVisibility((prev) => ({ ...prev, id: value }))
                            }
                        >
                            id
                        </DropdownMenuCheckboxItem>

                        <DropdownMenuCheckboxItem
                            checked={columnVisibility.name}
                            onCheckedChange={(value) =>
                                setColumnVisibility((prev) => ({ ...prev, name: value }))
                            }
                        >
                            Name
                        </DropdownMenuCheckboxItem>

                        <DropdownMenuCheckboxItem
                            checked={columnVisibility.phoneNumber}
                            onCheckedChange={(value) =>
                                setColumnVisibility((prev) => ({ ...prev, phoneNumber: value }))
                            }
                        >
                            Phone Number
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={columnVisibility.lid}
                            onCheckedChange={(value) =>
                                setColumnVisibility((prev) => ({ ...prev, lid: value }))
                            }
                        >
                            LID
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={columnVisibility.username}
                            onCheckedChange={(value) =>
                                setColumnVisibility((prev) => ({ ...prev, username: value }))
                            }
                        >
                            Username
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={columnVisibility.pushname}
                            onCheckedChange={(value) =>
                                setColumnVisibility((prev) => ({ ...prev, pushname: value }))
                            }
                        >
                            Pushname
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={columnVisibility.createdAt}
                            onCheckedChange={(value) =>
                                setColumnVisibility((prev) => ({ ...prev, createdAt: value }))
                            }
                        >
                            Created At
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        )
    }

    if (isLoading) return (<Spinner className="h-5 w-5" />)

    if (contacts.length === 0) {
        return (
            <EmptyList
                title="Sin contactos"
                description="Agrega un contacto o espera a que se sincronicen los contactos"
                icon={<UsersIcon />}
                action={headerActions} />
        )
    }

    return (
        <>
            {headerActionsComponent()}
            <div className="flex-1 border rounded-lg overflow-hidden relative">
                <div className="absolute inset-0 overflow-auto">
                    <Table>
                        <TableHeader className="sticky">
                            <TableRow className="sticky">
                                {enableSelection && (
                                    <TableHead className="w-[50px]">
                                        <Checkbox
                                            checked={isAllSelected || (isSomeSelected ? "indeterminate" : false)}
                                            onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                        />
                                    </TableHead>
                                )}
                                {columnVisibility.id && <TableHead>id</TableHead>}
                                {columnVisibility.name && <TableHead>Name</TableHead>}
                                {columnVisibility.phoneNumber && <TableHead>Phone Number</TableHead>}
                                {columnVisibility.lid && <TableHead>LID</TableHead>}
                                {columnVisibility.username && <TableHead>Username</TableHead>}
                                {columnVisibility.pushname && <TableHead>Pushname</TableHead>}
                                {columnVisibility.createdAt && <TableHead>Created At</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(contacts.map((contact) => (
                                <TableRow key={String(contact.id)}>
                                    {enableSelection && (
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedIds.has(String(contact.id))}
                                                onCheckedChange={(checked) => handleSelectOne(!!checked, String(contact.id))}
                                            />
                                        </TableCell>
                                    )}
                                    {columnVisibility.id && (
                                        <TableCell>{contact.id || "-"}</TableCell>
                                    )}
                                    {columnVisibility.name && (
                                        <TableCell>
                                            <Link href={`/contacts/${contact.id}`} className="text-blue-600 hover:underline">
                                                {getContactIdentifier(contact)}
                                            </Link>
                                        </TableCell>
                                    )}
                                    {columnVisibility.phoneNumber && (
                                        <TableCell>{contact.phone_number || "-"}</TableCell>
                                    )}
                                    {columnVisibility.lid && (
                                        <TableCell>{contact.lid || "-"}</TableCell>
                                    )}
                                    {columnVisibility.username && (
                                        <TableCell>{contact.username || "-"}</TableCell>
                                    )}
                                    {columnVisibility.pushname && (
                                        <TableCell>{contact.pushname || "-"}</TableCell>
                                    )}
                                    {columnVisibility.createdAt && (
                                        <TableCell>
                                            {new Date(contact.created_at).toLocaleString()}
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <Pagination
                page={page}
                pageSize={pageSize}
                setPage={setPage}
                totalPages={response?.totalPages || 0}
                setPageSize={setPageSize}
            />
        </>
    );
}
