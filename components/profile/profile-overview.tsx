import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { Building2, Calendar } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { UserProfile } from '@/stores/user-store';

interface ProfileOverviewProps {
  user: UserProfile | null;
  supabaseUser: User | null;
  businessName?: string | null;
  className?: string;
  action?: ReactNode;
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

function formatProfileDate(value?: string | null): string | null {
  if (!value) return null;
  const date = DATE_ONLY.test(value) ? new Date(`${value}T00:00:00`) : new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function ProfileOverview({ user, supabaseUser, businessName, className, action }: ProfileOverviewProps) {
  const fullName = [user?.name, user?.last_name].filter(Boolean).join(' ');
  const displayName = fullName || supabaseUser?.email?.split('@')[0] || 'Bienvenido';
  const avatarUrl = user?.avatar_url || supabaseUser?.user_metadata?.avatar_url || '';
  const profileEmail = user?.email || supabaseUser?.email || null;
  const joinedAt = formatProfileDate(supabaseUser?.created_at);

  return (
    <div className={cn('grid gap-8 md:grid-cols-[220px_minmax(0,1fr)] md:gap-10', className)}>
      <aside className="flex flex-col items-center text-center md:items-start md:text-left">
        <Avatar className="size-24 ring-2 ring-border ring-offset-2 ring-offset-background">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback className="bg-muted text-2xl font-semibold">
            {displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="mt-4 w-full min-w-0 space-y-1.5">
          <h2 className="truncate text-xl font-semibold tracking-tight">{displayName}</h2>
          {profileEmail && (
            <p className="truncate text-sm text-muted-foreground">{profileEmail}</p>
          )}
          {(businessName || joinedAt) && (
            <div className="flex flex-col items-center gap-1 pt-1 text-xs text-muted-foreground md:items-start">
              {businessName && (
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="size-3.5" />
                  {businessName}
                </span>
              )}
              {joinedAt && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  Miembro desde {joinedAt}
                </span>
              )}
            </div>
          )}
        </div>
      </aside>

      <section className="min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Información personal
          </h3>
          {action}
        </div>
        <dl className="mt-2 divide-y divide-border/60">
          <ProfileInfoRow label="Nombre" value={fullName} />
          <ProfileInfoRow label="Correo" value={user?.email} />
          <ProfileInfoRow label="Teléfono" value={user?.phone} />
          <ProfileInfoRow label="Fecha de nacimiento" value={formatProfileDate(user?.birth_date)} />
          <ProfileInfoRow label="País" value={user?.country} />
        </dl>
      </section>
    </div>
  );
}

function ProfileInfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start justify-between gap-6 py-3">
      <dt className="shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          'min-w-0 break-words text-right text-sm font-medium',
          !value && 'font-normal text-muted-foreground/60'
        )}
      >
        {value || 'Sin definir'}
      </dd>
    </div>
  );
}
