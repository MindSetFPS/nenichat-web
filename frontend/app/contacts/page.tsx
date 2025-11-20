"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ContactsTable } from "@/components/contacts-table";

export default function ContactsPage() {
    const [isSyncing, setIsSyncing] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleSyncContacts = async () => {
        setIsSyncing(true);
        try {
            const response = await fetch("/api/contacts/sync");
            if (!response.ok) {
                throw new Error("Failed to sync contacts");
            }
            const data = await response.json();
            console.log("Sync response:", data);
            // Trigger refresh of the table
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error("Error syncing contacts:", error);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleSelection = (selectedRows: any[]) => {
        console.log("Selected rows:", selectedRows);
    };

    return (
        <div className="container mx-auto space-y-4 p-4 pt-6 h-[calc(100vh-2rem)] flex flex-col">
            <h2 className="text-3xl font-bold tracking-tight">Contacts</h2>
            <ContactsTable
                endpoint="/api/contacts"
                refreshTrigger={refreshTrigger}
                headerActions={
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
                }
            />
        </div>
    );
}
