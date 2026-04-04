import { Suspense } from "react";
import { RecentChats } from "@/components/chat/recent-chats";
import Content from "@/components/layout/content";
import { ChatListLoader } from "./chat-list-loader";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SupabaseContainerRepository } from "@/Nenichat/Containers/Infrastructure/Supabase/SupabaseContainerRepository";
import { getBusinessFromUser } from "@/lib/user-auth";
import { Spinner } from "@/components/ui/spinner";

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

  const isConnected = containerData && containerData.status === "connected"

  return (
    <Content className="flex flex-col md:flex-row">
      <Suspense fallback={
        <div className="w-full md:max-w-52 lg:max-w-xs md:border-r p-4">
          <Spinner className="size-6" />
        </div>
      }>
        <RecentChatsWrapper isConnected={isConnected} businessId={business.id} />
      </Suspense>
      <div className="flex-1 overflow-hidden bg-background">
        {children}
      </div>
    </Content>
  )
}

async function RecentChatsWrapper({ isConnected, businessId }: { isConnected: boolean, businessId?: string }) {
  if (!isConnected) {
    return (
      <RecentChats
        className="w-full md:max-w-52 lg:max-w-xs md:border-r"
        contacts="[]" />
    )
  }

  const contactsWithLastMessage = await ChatListLoader({ businessIdProp: businessId })
  const contactsWithLastMessageJSON = JSON.stringify(contactsWithLastMessage)

  return (
    <RecentChats
      className="w-full md:max-w-52 lg:max-w-xs md:border-r"
      contacts={contactsWithLastMessageJSON} />
  )
}
