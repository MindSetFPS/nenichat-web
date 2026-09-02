import { Suspense } from "react";
import { RecentChats } from "@/components/chat/recent-chats";
import { RecreateButton } from "@/components/chat/recreate-button";
import Content from "@/components/layout/content";
import { ChatListLoader } from "./chat-list-loader";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SupabaseContainerRepository } from "@/Nenichat/Containers/Infrastructure/Supabase/SupabaseContainerRepository";
import { getBusinessFromUser } from "@/lib/user-auth";
import { Spinner } from "@/components/ui/spinner";
import type { IChat } from "@/Nenichat/Chats/domain/IChat";

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
  const isUnreachable = containerData?.status === "unreachable"
  const isDeployed = containerData?.status === "deployed"

  let chatsSortedByLastMessage: IChat[] = []
  let error: 'disconnected' | 'unreachable' | null = null

  if (isUnreachable) {
    error = 'unreachable'
  } else if (isDeployed) {
    error = 'disconnected'
  } else if (isConnected) {
    const result = await ChatListLoader({ businessIdProp: business.id })
    chatsSortedByLastMessage = result.chats
    error = result.error
  }

  if (error) {
    return (
      <Content className="flex flex-col md:flex-row">
        <ContainerError error={error} businessId={business.id} />
      </Content>
    )
  }

  return (
    <Content className="flex flex-col md:flex-row">
      <Suspense fallback={
        <div className="w-full md:max-w-52 lg:max-w-xs md:border-r p-4">
          <Spinner className="size-6" />
        </div>
      }>
        <RecentChats className="w-full md:max-w-52 lg:max-w-xs md:border-r" chatsSortedByLastMessage={JSON.stringify(chatsSortedByLastMessage)} />
      </Suspense>
      <div className="flex-1 overflow-hidden bg-background">
        {children}
      </div>
    </Content>
  )
}

function ContainerError({ error, businessId }: { error: 'disconnected' | 'unreachable', businessId: string }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center">
      {error === 'disconnected' ? (
        <>
          <div className="size-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-6">
            <svg className="size-8 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Sesión de WhatsApp expirada</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            La sesión de WhatsApp se ha desconectado. Escanea el código QR para reconectar tu número.
          </p>
          <a
            href="/wapp"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-6 py-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Reconectar
          </a>
        </>
      ) : (
        <>
          <div className="size-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
            <svg className="size-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Contenedor no disponible</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            El contenedor de WhatsApp no está respondiendo. Recrea el contenedor para restablecer la conexión.
          </p>
          <RecreateButton businessId={businessId} />
        </>
      )}
    </div>
  )
}
