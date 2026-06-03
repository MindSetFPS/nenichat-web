import { IChat } from "@/Nenichat/Chats/domain/IChat";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SupabaseContainerRepository } from "@/Nenichat/Containers/Infrastructure/Supabase/SupabaseContainerRepository";
import { getBusinessFromUser } from "@/lib/user-auth";
import { GoWappChatRepository } from "@/Nenichat/Chats/infra/api"

interface ChatListLoaderProps {
  businessIdProp?: string
}

export type ChatListError = 'disconnected' | 'unreachable' | null

export async function ChatListLoader({ businessIdProp }: ChatListLoaderProps): Promise<{ chats: IChat[]; error: ChatListError }> {
  let businessId = businessIdProp

  if (!businessId) {
    const supabase = await createServerSupabaseClient();
    const { business, error: authError } = await getBusinessFromUser(supabase)

    if (authError || !business) {
      return { chats: [], error: null };
    }

    const containerRepository = new SupabaseContainerRepository(supabase)
    const containerData = await containerRepository.getContainerByBusinessId(business.id)

    if (!containerData || containerData.status !== "connected") {
      return { chats: [], error: null };
    }
    businessId = business.id
  }

  const url = "http://192.168.1.64" + "/api/user" + "/" + businessId
  const wappChatRepository = new GoWappChatRepository(url, "admin", "admin")

  try {
    const chats = await wappChatRepository.list(0, 26)
    return { chats, error: null }
  } catch {
    const supabase = await createServerSupabaseClient();
    const containerRepository = new SupabaseContainerRepository(supabase)

    const isAlive = await checkContainerHealth(url)

    console.log(isAlive)
    console.log(`Container health check for ${url}: ${isAlive ? 'alive' : 'dead'}`)

    if (isAlive) {
      await containerRepository.updateContainerState(Number(businessId), 'deployed')
      return { chats: [], error: 'disconnected' }
    } else {
      await containerRepository.updateContainerState(Number(businessId), 'unreachable')
      return { chats: [], error: 'unreachable' }
    }
  }
}

async function checkContainerHealth(baseUrl: string): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(`${baseUrl}/devices`, {
      headers: {
        'Authorization': `Basic ${btoa('admin:admin')}`
      },
      signal: controller.signal
    })
    clearTimeout(timeout)
    return response.ok || response.status >= 400
  } catch {
    return false
  }
}
