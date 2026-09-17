import { RecentChats } from "@/components/chat/recent-chats";
import Content from "@/components/layout/content";
import { ChatListLoader } from "./chat-list-loader";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SupabaseContainerRepository } from "@/Nenichat/Containers/Infrastructure/Supabase/SupabaseContainerRepository";
import { getBusinessFromUser } from "@/lib/user-auth";
import { WhatsAppSettings } from "@/components/settings/whatsapp-settings";
import { EmptyChats } from "@/components/chat/empty-chats";

export const metadata = {
  title: 'Chats'
}

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabaseClient();
  const { business, error: authError } = await getBusinessFromUser(supabase)

  if (authError) return <div>Unauthorized</div>
  if (!business) throw new Error("No tienes un negocio");

  const containerRepository = new SupabaseContainerRepository(supabase)
  const containerData = await containerRepository.getContainerByBusinessId(business.id)

  if (containerData?.status === "connected") {
    const { chats, error: chatError } = await ChatListLoader({ businessIdProp: business.id })

    if (chatError) {
      return (
        <Content className="flex flex-row items-center justify-center">
          <WhatsAppSettings />
        </Content>
      )
    }

    return (
      <Content className="flex flex-col md:flex-row">
        <RecentChats className="w-full md:max-w-52 lg:max-w-xs md:border-r" chatsSortedByLastMessage={JSON.stringify(chats)} />
        <div className="flex-1 overflow-hidden bg-background">
          {children}
        </div>
      </Content>
    )
  }

  return (
    <Content className="flex flex-row items-center justify-center">
      <EmptyChats />
    </Content>
  )
}
