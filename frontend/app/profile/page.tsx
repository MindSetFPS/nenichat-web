"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { IContact } from '@/repository/IContact';
import { ComboboxDemo } from './combobox';
import { useDebounce } from '@/hooks/use-debounce';

const MyProfilePage = () => {
  const [user, setUser] = useState<IContact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to fetch user', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <h1 className="text-4xl font-bold">My Profile</h1>
        <p className="mt-3 text-xl">
          Loading...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <h1 className="text-4xl font-bold">My Profile</h1>
        <p className="mt-3 text-xl">
          User profile not found. Please select your profile.
        </p>
        <ProfileSelector onUserSelected={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={''} alt={user.pushname || user.username || 'User'} />
              <AvatarFallback>{(user.pushname || user.username || 'U').charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{user.pushname || user.username}</CardTitle>
              <CardDescription>{user.phone_number}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Username</h3>
              <p>{user.username || 'Not set'}</p>
            </div>
            <div>
              <h3 className="font-semibold">LID</h3>
              <p>{user.lid || 'Not set'}</p>
            </div>
            <div>
              <h3 className="font-semibold">Contact Name</h3>
              <p>{user.contact_name || 'Not set'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ProfileSelector = ({ onUserSelected }: { onUserSelected: () => void }) => {
  const [contacts, setContacts] = useState<IContact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      try {
        let url = '/api/contacts/search';
        if (debouncedSearchTerm && debouncedSearchTerm.length > 2) {
          url += `?query=${debouncedSearchTerm}`;
        } else if (debouncedSearchTerm === '') {
          // Fetch all contacts on initial load or when search term is cleared
          url = '/api/contacts'; // Assuming this endpoint fetches all contacts
        } else {
          // If search term is 1 or 2 characters, clear contacts and don't fetch
          // setContacts([]);
          return;
        }

        const response = await fetch(url);
        const data = await response.json();
        console.log(data)
        setContacts(data.data);
      } catch (error) {
        console.error("Failed to fetch contacts:", error);
        setContacts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, [debouncedSearchTerm]);

  const handleSelectContact = async (contactId: string) => {
    await fetch('/api/profile/set-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: contactId }),
    });
    onUserSelected();
  };

  return (
    <ComboboxDemo
      contacts={contacts}
      onSearch={setSearchTerm}
      onSelectContact={handleSelectContact}
      loading={loading}
    />
  );
};

export default MyProfilePage;
