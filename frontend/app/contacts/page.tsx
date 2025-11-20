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

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
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
