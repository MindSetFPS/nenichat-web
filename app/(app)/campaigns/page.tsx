import { CalendarDays } from "lucide-react";
import { SupabaseCampaignRepository } from '@/Nenichat/Campaigns/infra/persistance/SupabaseCampaignRepository';
import { ICampaign } from '@/Nenichat/Campaigns/domain/ICampaign';
import { CreateCampaignDialog } from "@/components/CreateCampaignDialog";
import { EmptyList } from "@/components/empty-list";
import { PageHeader } from "@/components/ui/page-header";
import { CampaignSection } from "@/components/campaigns/campaign-section";

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getBusinessFromUser } from '@/lib/user-auth';

export const dynamic = 'force-dynamic';

export default async function CampaignsPage() {
  const supabase = await createServerSupabaseClient();
  const { business, error: authError } = await getBusinessFromUser(supabase);

  if (authError || !business) return <div>No autorizado</div>;

  const campaignRepository = new SupabaseCampaignRepository(supabase);
  const allCampaigns: ICampaign[] = await campaignRepository.list(business.id, 0, 100);


  if (allCampaigns.length === 0) {
    return (
      <>
        <PageHeader />
        <EmptyList
          title="Sin campañas"
          description="Parece que no has creado ninguna campaña. ¡Empieza creando una!"
          action={<CreateCampaignDialog />}
          icon={<CalendarDays className="w-12 h-12 text-primary" />}
        />
      </>
    )
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0); // Normalize 'now' to start of today for comparison

  const startOfDay = new Date(now);

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as start of week

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const sortedCampaigns = allCampaigns.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const futureCampaigns = sortedCampaigns.filter(
    (campaign) => campaign.run_at && new Date(campaign.run_at) > now && new Date(campaign.run_at).toDateString() !== startOfDay.toDateString()
  );

  const todayCampaigns = sortedCampaigns.filter(
    (campaign) => campaign.run_at && new Date(campaign.run_at).toDateString() === startOfDay.toDateString()
  );

  const thisWeekCampaigns = sortedCampaigns.filter(
    (campaign) =>
      campaign.run_at &&
      new Date(campaign.run_at) >= startOfWeek &&
      new Date(campaign.run_at) < startOfDay
  );

  const thisMonthCampaigns = sortedCampaigns.filter(
    (campaign) =>
      campaign.run_at &&
      new Date(campaign.run_at) >= startOfMonth &&
      new Date(campaign.run_at) < startOfWeek
  );

  const olderCampaigns = sortedCampaigns.filter(
    (campaign) =>
      !campaign.run_at || new Date(campaign.run_at) < startOfMonth
  );



  return (
    <>
      <PageHeader title="Campañas">
        {allCampaigns.length > 0 && <CreateCampaignDialog />}
      </PageHeader>

      <div className="overflow-y-auto h-full">
        {allCampaigns.length === 0 ? (
          <EmptyList
            title="Sin campañas"
            description="Parece que no has creado ninguna campaña. ¡Empieza creando una!"
            action={<CreateCampaignDialog />}
            icon={<CalendarDays className="w-12 h-12 text-primary" />}
          />
        ) : (
          <>
            <p>Para que funcione correctamente necesitamos:
              1. Aleatorizar el mensaje para evitar los filtros de spam.
              2. Solo enviar mensajes a usuarios activos (que hayan hablado en las últimas 24 horas).
              3. Límites de tiempo y aleatorización para evitar ser marcado como spam.
            </p>
            <CampaignSection title="Campañas próximas" campaigns={futureCampaigns} />
            <CampaignSection title="Campañas de hoy" campaigns={todayCampaigns} />
            <CampaignSection title="Campañas de esta semana" campaigns={thisWeekCampaigns} />
            <CampaignSection title="Campañas de este mes" campaigns={thisMonthCampaigns} />
            <CampaignSection title="Campañas anteriores" campaigns={olderCampaigns} />
          </>
        )}
      </div>
    </>
  );
}