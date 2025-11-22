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
import { IContact } from "@/repository/IContact";
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

    const selectedIds = controlledSelectedIds ? new Set(controlledSelectedIds) : internalSelectedIds;

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const newSelected = new Set(selectedIds);
            response?.data.forEach((contact) => newSelected.add(String(contact.id)));
            if (!controlledSelectedIds) setInternalSelectedIds(newSelected);
            onSelectionChange?.(Array.from(newSelected));
        } else {
            const newSelected = new Set(selectedIds);
            response?.data.forEach((contact) => newSelected.delete(String(contact.id)));
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

    const isAllSelected = response?.data.length! > 0 && response?.data.every((contact) => selectedIds.has(String(contact.id)));
    const isSomeSelected = response?.data.some((contact) => selectedIds.has(String(contact.id))) && !isAllSelected;

    const fetchContacts = async (page: number, size: number) => {
        setIsLoading(true);
        try {
            const response = await fetch(`${endpoint}?page=${page}&pageSize=${size}`);
            if (!response.ok) {
                throw new Error("Failed to fetch contacts");
            }
            const data: IContactResponse = await response.json();
            setResponse(data);
        } catch (error) {
            console.error("Error fetching contacts:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts(page, pageSize);
    }, [page, pageSize, endpoint, refreshTrigger]);

    // Expose a refresh method if needed, or just rely on internal state.
    // If the parent needs to trigger a refresh (like after sync), we might need a ref or a dependency prop.
    // For now, let's assume the parent might pass a key or we can expose a ref later if needed.
    // Actually, for the "Sync" button which is passed as headerActions, it might want to refresh this table.
    // A simple way is to accept a `refreshTrigger` prop.

    // Let's add a way to refresh.
    // But wait, the user said "includes the dropdown menu, and pagination buttons".
    // The sync button is external (headerActions).
    // If I click sync in parent, I want this table to refresh.
    // I'll add a `refreshKey` prop or `onRef`? 
    // Let's stick to the simple requirement first. The user didn't explicitly ask for refresh coordination yet, 
    // but it's implied by the existing code.
    // I will add a `refreshId` prop that when changed, triggers a refetch.

    const getContactName = (contact: IContact) => {
        return contact.contact_name || contact.pushname || contact.username || contact.phone_number || contact.lid || "Unknown";
    };

    function headerActionsComponent() {
        return (
            <div className="flex items-center justify-between space-y-2">
                <div className="flex gap-2">
                    {headerActions}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
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
            </div>
        )
    }

    if (isLoading) return (<Spinner className="h-5 w-5" />)

    if (response && response?.data.length === 0) {
        return (
            <EmptyList
                title="Sin contactos"
                description="Agrega un contacto o espera a que se sincronicen los contactos"
                icon={<UsersIcon />}
                action="" />
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
                            {(response?.data.map((contact) => (
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
                                                {getContactName(contact)}
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
