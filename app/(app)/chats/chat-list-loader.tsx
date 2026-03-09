import { IChat } from "@/Nenichat/Chats/domain/IChat";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SupabaseContainerRepository } from "@/Nenichat/Containers/Infrastructure/Supabase/SupabaseContainerRepository";
import { getBusinessFromUser } from "@/lib/user-auth";
import { GoWappChatRepository } from "@/Nenichat/Chats/infra/api"

export async function ChatListLoader(): Promise<IChat[]> {
  const supabase = await createServerSupabaseClient();
  const { business, error: authError } = await getBusinessFromUser(supabase)

  if (authError || !business) {
    return [];
  }

  const containerRepository = new SupabaseContainerRepository(supabase)
  const containerData = await containerRepository.getContainerByBusinessId(business.id)

  if (!containerData || containerData.status !== "connected") {
    return [];
  }

  const url = "http://192.168.1.64" + "/api/user" + "/" + business.id
  const wappChatRepository = new GoWappChatRepository(url, "admin", "admin")
  return await wappChatRepository.list(0, 26)
}
