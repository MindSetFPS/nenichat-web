'use client';

import { useEffect, useState } from 'react';
import { IContact } from '@/Nenichat/Contacts/domain/IContact';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Pagination } from '@/components/ui/pagination';

interface ContactCandidate extends Omit<IContact, 'id'> {
  id: string;
}

export default function MergeContactsPage() {
  const [candidates, setCandidates] = useState<ContactCandidate[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [primaryContactId, setPrimaryContactId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const PAGE_SIZE = 20;

  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/contacts/candidates?page=${currentPage}&limit=${PAGE_SIZE}`);
      if (!response.ok) {
        throw new Error('Failed to fetch merge candidates');
      }
      const result = await response.json();
      const data = result.data;
      setTotalPages(result.meta.totalPages);
      setTotalCandidates(result.meta.total);

      // In Next.js, when data is serialized from server to client, BigInts are often converted to strings.
      // We'll work with strings for IDs on the client side to avoid issues.
      setCandidates(data.map((c: any) => ({ ...c, id: c.id ? c.id.toString() : '' })));
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [currentPage]);

  const handleSelect = (contactId: string, isChecked: boolean) => {
    const newSelected = { ...selected };
    if (isChecked) {
      newSelected[contactId] = true;
    } else {
      delete newSelected[contactId];
      if (primaryContactId === contactId) {
        setPrimaryContactId(null);
      }
    }
    setSelected(newSelected);
  };

  const handleMerge = async () => {
    if (!primaryContactId) {
      toast.error('Please select a primary contact to merge into.');
      return;
    }

    const secondaryContactIds = Object.keys(selected)
      .filter((id) => id !== primaryContactId);

    if (secondaryContactIds.length === 0) {
      toast.error('Please select at least one secondary contact to merge.');
      return;
    }

    try {
      const response = await fetch('/api/contacts/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryContactId: primaryContactId,
          secondaryContactIds: secondaryContactIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to merge contacts');
      }

      toast.success('Contacts merged successfully!');
      setSelected({});
      setPrimaryContactId(null);
      fetchCandidates(); // Refresh the list
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const selectedContacts = Object.keys(selected);

  return (
    <>
      <div className="flex-none">
        <PageHeader content={<h1 className="text-2xl font-bold">Merge Contacts</h1>} />
        <p className="mb-4 text-muted-foreground">Select contacts to merge. Choose one as the primary contact, and the others will be merged into it.</p>
        <div className="">
          <Button
            onClick={handleMerge}
            disabled={!primaryContactId || selectedContacts.length < 2}
          >
            Merge Selected ({selectedContacts.length})
          </Button>
        </div>
      </div>

      <div className="flex-1 border rounded-lg overflow-hidden relative min-h-0">
        <div className="absolute inset-0 overflow-auto">
          <Table className="w-full caption-bottom text-sm">
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-[50px]">Select</TableHead>
                <TableHead>Primary</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>LID</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Pushname</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">Loading...</TableCell>
                </TableRow>
              ) : candidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">No merge candidates found.</TableCell>
                </TableRow>
              ) : (
                candidates.map((contact) => (
                  <TableRow key={contact.id} className='overflow-y-auto h-full'>
                    <TableCell>
                      <Checkbox
                        checked={!!selected[contact.id]}
                        onCheckedChange={(checked) => handleSelect(contact.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell>
                      {selected[contact.id] && (
                        <Button
                          variant={primaryContactId === contact.id ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPrimaryContactId(contact.id)}
                        >
                          {primaryContactId === contact.id ? 'Primary' : 'Set Primary'}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>{contact.id}</TableCell>
                    <TableCell>{contact.phone_number || 'N/A'}</TableCell>
                    <TableCell>{contact.lid || 'N/A'}</TableCell>
                    <TableCell>{contact.username || 'N/A'}</TableCell>
                    <TableCell>{contact.pushname || 'N/A'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Pagination
        page={currentPage}
        pageSize={totalPages}
        setPage={setCurrentPage}
        totalPages={totalPages}
      />
    </>
  );
}
