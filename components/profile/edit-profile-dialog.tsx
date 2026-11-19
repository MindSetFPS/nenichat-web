'use client';

import { useState, type ReactNode } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ProfileForm } from '@/components/forms/profile-form';
import type { UserProfile } from '@/stores/user-store';

interface EditProfileDialogProps {
  user: UserProfile;
  trigger?: ReactNode;
}

export function EditProfileDialog({ user, trigger }: EditProfileDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <Pencil className="size-4" />
            Editar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
          <DialogDescription>
            Actualiza tu información personal. Los campos vacíos se guardan como “sin definir”.
          </DialogDescription>
        </DialogHeader>
        <ProfileForm initialData={user} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
