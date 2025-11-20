"use client";

import { useState, useEffect } from "react";
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
        name: boolean;
        phoneNumber: boolean;
        lid: boolean;
        username: boolean;
        pushname: boolean;
        createdAt: boolean;
    };
    headerActions?: React.ReactNode;
    refreshTrigger?: number;
}

export function ContactsTable({
    endpoint,
    defaultColumnVisibility = {
        name: true,
        phoneNumber: true,
        lid: true,
        username: true,
        pushname: true,
        createdAt: true,
    },
    headerActions,
    refreshTrigger = 0,
}: ContactsTableProps) {
    const [response, setResponse] = useState<IContactResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [columnVisibility, setColumnVisibility] = useState(defaultColumnVisibility);

    const fetchContacts = async (page: number, size: number) => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `${endpoint}?page=${page}&pageSize=${size}`
            );
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

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPageSize(Number(e.target.value));
        setPage(1);
    };

    const getContactName = (contact: IContact) => {
        return contact.contact_name || contact.pushname || contact.username || contact.phone_number || contact.lid || "Unknown";
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Contacts</h2>
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

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Spinner className="h-5 w-5" />
                </div>
            ) : (
                <>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {columnVisibility.name && <TableHead>Name</TableHead>}
                                    {columnVisibility.phoneNumber && <TableHead>Phone Number</TableHead>}
                                    {columnVisibility.lid && <TableHead>LID</TableHead>}
                                    {columnVisibility.username && <TableHead>Username</TableHead>}
                                    {columnVisibility.pushname && <TableHead>Pushname</TableHead>}
                                    {columnVisibility.createdAt && <TableHead>Created At</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {response?.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={Object.values(columnVisibility).filter(Boolean).length}
                                            className="h-24 text-center"
                                        >
                                            No contacts found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    response?.data.map((contact) => (
                                        <TableRow key={String(contact.id)}>
                                            {columnVisibility.name && (
                                                <TableCell>{getContactName(contact)}</TableCell>
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
                    <div className="flex justify-between items-center space-x-2 py-4">
                        <div>
                            <select
                                value={pageSize}
                                onChange={handlePageSizeChange}
                                className="p-2 border rounded-md"
                            >
                                <option value={10}>10 per page</option>
                                <option value={20}>20 per page</option>
                                <option value={50}>50 per page</option>
                                <option value={100}>100 per page</option>
                            </select>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm">
                                Page {response?.page} of {response?.totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(page + 1)}
                                disabled={page === response?.totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
