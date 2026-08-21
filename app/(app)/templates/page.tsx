import { SupabaseTemplateRepository } from '@/Nenichat/Templates/infra/persistance/SupabaseTemplateRepository'
import { ITemplate } from '@/Nenichat/Templates/domain/ITemplate'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getBusinessFromUser } from '@/lib/user-auth'
import { TemplateList } from '@/components/templates/template-list'

export const dynamic = 'force-dynamic'

export default async function TemplatesPage() {
  const supabase = await createServerSupabaseClient()
  const { business, error: authError } = await getBusinessFromUser(supabase)

  if (authError || !business) {
    return <div>No autorizado</div>
  }

  const repo = new SupabaseTemplateRepository(supabase)
  const templates: ITemplate[] = await repo.list(business.id)
  const serialized = JSON.parse(JSON.stringify(templates))

  return <TemplateList initialTemplates={serialized} />
}
