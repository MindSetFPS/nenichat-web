import { IChat } from "@/Nenichat/Chats/domain/IChat";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SupabaseContainerRepository } from "@/Nenichat/Containers/Infrastructure/Supabase/SupabaseContainerRepository";
import { getBusinessFromUser } from "@/lib/user-auth";
import { GoWappChatRepository } from "@/Nenichat/Chats/infra/api"
import { checkWappHealth } from "@/Nenichat/Wapp"

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

  const wappRecentChatsRepository = new GoWappChatRepository({
    deviceId: String(businessId),
    baseUrl: process.env.NEXT_PUBLIC_WAPP_API_URL,
    password: process.env.WAPP_PASSWORD,
    user: process.env.WAPP_USER
  })

  try {
    const chats = await wappRecentChatsRepository.list(0, 26) // returns the most recent 26 chats. does not have contact data
    return { chats, error: null }
  } catch {
    const supabase = await createServerSupabaseClient();
    const containerRepository = new SupabaseContainerRepository(supabase)

    const isAlive = await checkWappHealth(undefined, { deviceId: businessId })

    if (isAlive) {
      await containerRepository.updateContainerState(Number(businessId), 'deployed')
      return { chats: [], error: 'disconnected' }
    } else {
      await containerRepository.updateContainerState(Number(businessId), 'unreachable')
      return { chats: [], error: 'unreachable' }
    }
  }
}
