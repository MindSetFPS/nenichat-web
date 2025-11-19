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

export default function ContactsPage() {
    const [response, setResponse] = useState<IContactResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [columnVisibility, setColumnVisibility] = useState({
        name: true,
        phoneNumber: true,
        lid: true,
        username: true,
        pushname: true,
        createdAt: true,
    });

    const fetchContacts = async (page: number, size: number) => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `/api/contacts?page=${page}&pageSize=${size}`
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
    }, [page, pageSize]);

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPageSize(Number(e.target.value));
        setPage(1); // Reset to first page when page size changes
    };

    const getContactName = (contact: IContact) => {
        return contact.contact_name || contact.pushname || contact.username || contact.phone_number || contact.lid || "Unknown";
    };

    const handleSyncContacts = async () => {
        setIsSyncing(true);
        try {
            const response = await fetch("/api/contacts/sync");
            if (!response.ok) {
                throw new Error("Failed to sync contacts");
            }
            const data = await response.json();
            console.log("Sync response:", data);
            // Refresh the contacts list after sync
            await fetchContacts(page, pageSize);
        } catch (error) {
            console.error("Error syncing contacts:", error);
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Contacts</h2>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleSyncContacts}
                        disabled={isSyncing}
                    >
                        {isSyncing ? (
                            <>
                                <Spinner className="h-4 w-4 mr-2" />
                                Syncing...
                            </>
                        ) : (
                            "Sync Contacts"
                        )}
                    </Button>
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
