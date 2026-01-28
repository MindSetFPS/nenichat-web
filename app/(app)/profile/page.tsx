"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { IContact } from '@/Nenichat/Contacts/domain/IContact';
import { ComboboxDemo } from './combobox';
import { useDebounce } from '@/hooks/use-debounce';

import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { User } from '@supabase/supabase-js';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShineBorder } from '@/components/ui/shine-border';
import { Skeleton } from '@/components/ui/skeleton';
import { LogOut, User as UserIcon, Mail, ShieldCheck, Calendar, Phone, AtSign, Fingerprint, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';


const MyProfilePage = () => {
  const [user, setUser] = useState<IContact | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserSupabaseClient()
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const [profileRes, authRes] = await Promise.all([
          fetch('/api/profile'),
          supabase.auth.getUser()
        ]);

        if (profileRes.ok) {
          const userData = await profileRes.json();
          setUser(userData);
        }

        if (authRes.data.user) {
          setSupabaseUser(authRes.data.user);
        }
      } catch (error) {
        console.error('Failed to fetch user', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-6 animate-in fade-in duration-500">
        <Skeleton className="h-32 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!user && !supabaseUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 px-4 text-center animate-in zoom-in-95 duration-500">
        <div className="bg-primary/10 p-4 rounded-full mb-6">
          <UserIcon className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Profile Not Found</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-md">
          We couldn't find your profile data. Please select a contact to link to your account.
        </p>
        <div className="mt-10 w-full max-w-xs mx-auto">
          <ProfileSelector onUserSelected={() => window.location.reload()} />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">

      <div className="flex items-center justify-between w-full">
        <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive transition-colors">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>


      <div className="container mx-auto p-4 space-y-8 max-w-5xl">
        {/* Welcome Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/5 via-primary/10 to-transparent p-8 md:p-12 border border-primary/10">
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative">
              <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-background shadow-2xl">
                <AvatarImage src={''} alt={user?.pushname || user?.username || supabaseUser?.email || 'User'} />
                <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                  {(user?.pushname || user?.username || supabaseUser?.email || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-background p-1.5 rounded-full shadow-lg border">
                <div className="bg-green-500 w-4 h-4 rounded-full border-2 border-background animate-pulse" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                  {user?.pushname || user?.username || 'Welcome!'}
                </h2>
                {supabaseUser && (
                  <Badge variant="secondary" className="px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                    {supabaseUser.aud}
                  </Badge>
                )}
              </div>
              <p className="text-lg text-muted-foreground font-medium">
                {supabaseUser?.email || 'Manage your account and preferences'}
              </p>
              <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-4">
                <div className="flex items-center text-sm text-muted-foreground bg-background/50 px-3 py-1.5 rounded-full border">
                  <UserIcon className="w-4 h-4 mr-2 text-primary" />
                  [Name]
                </div>
                <div className="flex items-center text-sm text-muted-foreground bg-background/50 px-3 py-1.5 rounded-full border">
                  <Building2 className="w-4 h-4 mr-2 text-primary" />
                  [Business Name]
                </div>
                <div className="flex items-center text-sm text-muted-foreground bg-background/50 px-3 py-1.5 rounded-full border">
                  <Calendar className="w-4 h-4 mr-2 text-primary" />
                  Joined {supabaseUser ? new Date(supabaseUser.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'Recently'}
                </div>
                <div className="flex items-center text-sm text-muted-foreground bg-background/50 px-3 py-1.5 rounded-full border">
                  <ShieldCheck className="w-4 h-4 mr-2 text-primary" />
                  Verified Session
                </div>
              </div>
            </div>
          </div>

          {/* Decorative background blobs */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 ">
          {/* Security & Auth Card */}
          <div className="lg:col-span-2 space-y-8">
            {supabaseUser && (
              <Card className="relative p-0 overflow-hidden border-none shadow-xl bg-card/50 backdrop-blur-sm group border border-primary/10 rounded-lg">
                <CardHeader className="relative pt-6 z-10 border-b bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-xl">Authentication</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <InfoItem
                      icon={<AtSign className="w-4 h-4" />}
                      label="Email Address"
                      value={supabaseUser.email}
                    />
                    <InfoItem
                      icon={<Calendar className="w-4 h-4" />}
                      label="Account Created"
                      value={new Date(supabaseUser.created_at).toLocaleString()}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Local Data */}
          <div className="space-y-8">
            {user && (
              <Card className="border-none p-0 shadow-xl bg-card/50 backdrop-blur-sm h-fit overflow-hidden">
                <CardHeader className="bg-primary/5 border-b py-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-xl">Whatsapp Profile</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="flex flex-col items-center py-4 border-b border-dashed">
                    <Avatar className="w-20 h-20 mb-3 border-2 border-primary/20 p-1">
                      <AvatarImage src={''} alt={user.pushname || user.username || 'User'} />
                      <AvatarFallback className="bg-muted text-xl">
                        {(user.pushname || user.username || 'U').charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-bold text-lg">{user.pushname || user.username}</p>
                    <Badge variant="outline" className="mt-1 font-mono">{user.phone_number || 'No Phone'}</Badge>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <AtSign className="w-3.5 h-3.5" /> Username
                      </span>
                      <span className="font-medium">{user.username || 'Not set'}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5" /> LID
                      </span>
                      <span className="font-medium truncate max-w-[120px]" title={user.lid || ''}>{user.lid || 'Not set'}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <UserIcon className="w-3.5 h-3.5" /> Full Name
                      </span>
                      <span className="font-medium">{user.contact_name || 'Not set'}</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button variant="outline" className="w-full text-xs h-8" disabled>
                      Edit Profile Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div >
  );
};

// Helper component for layout consistency
const InfoItem = ({ icon, label, value, mono = false }: { icon: React.ReactNode, label: string, value: string | null | undefined, mono?: boolean }) => (
  <div className="space-y-1.5 group/item">
    <div className="flex items-center gap-2 text-muted-foreground group-hover/item:text-primary transition-colors">
      {icon}
      <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
    </div>
    <div className={`p-3 rounded-lg bg-background border border-border/60 group-hover/item:border-primary/30 transition-all ${mono ? 'font-mono text-xs break-all' : 'text-sm font-medium'}`}>
      {value || 'Not available'}
    </div>
  </div>
);

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
          url = '/api/contacts';
        } else {
          return;
        }

        const response = await fetch(url);
        const data = await response.json();
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
