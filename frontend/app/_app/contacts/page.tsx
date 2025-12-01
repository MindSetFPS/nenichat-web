"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ContactsTable } from "@/components/contacts-table";
import { PageHeader } from "@/components/ui/page-header";

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
            // Trigger refresh of the table
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error("Error syncing contacts:", error);
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <>
            <PageHeader content={<h1 className="text-2xl font-bold">Contacts</h1>} />
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
        </>
    );
}
