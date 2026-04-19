import { OrdersTotalValueChart } from "@/components/home/orders-total-chart";
import { SupabaseOrderRepository } from "@/Nenichat/Orders/infra/persistance/SupabaseOrderRepository";
import { OrderProductChart } from "@/components/home/product-orders-chart";
import BusinessSummary from "@/components/home/business-summary";
import { RecentOrdersFeed } from "@/components/home/recent-orders-feed";
import { MonthlyGoalCard } from "@/components/home/monthly-goal-card";
import { GoWappChatRepository } from "@/Nenichat/Chats/infra/api";
import { SupabaseContainerRepository } from "@/Nenichat/Containers/Infrastructure/Supabase/SupabaseContainerRepository";
import { RecentConversations } from "@/components/home/recent-conversations";
import { MessageSquare } from "lucide-react";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { PageHeader } from "@/components/ui/page-header";
import Content from "@/components/layout/content";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CreateBusinessSection } from "@/components/forms/create-business-section";
import { requireAuth } from "@/lib/auth";
import { WelcomePage } from "@/components/home/welcome-page";
import { Card } from "@/components/ui/card";
import { ActionRequiredCard } from "@/components/home/action-required-card";
import { OutstandingPaymentsCard } from "@/components/home/outstanding-payments-card";
import { SupabaseContactRepository } from "@/Nenichat/Contacts/infra/persistance/SupabaseContactRepository";
import Greeting from "@/components/home/greeting";

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Home',
}

export default async function Page() {
  const supabase = await createServerSupabaseClient();
  const user = await requireAuth();

  const { data: businesses } = await supabase
    .from('business')
    .select('*')
    .eq('owner_id', user.id)
    .limit(1);

  const business = businesses && businesses.length > 0 ? businesses[0] : null;

  if (!business) {
    return (
      <Content className="p-4 scroll-auto overflow-y-auto">
        <PageHeader title="Bienvenido" />
        <CreateBusinessSection />
      </Content>
    );
  }

  const orderRepository = new SupabaseOrderRepository(supabase);
  const containerRepository = new SupabaseContainerRepository(supabase);
  const containerData = await containerRepository.getContainerByBusinessId(business.id);

  const messagesPerDay: any[] = []; //await messageRepository.getMessageCountPerDay(business.id, 14);
  const orders: any[] = await orderRepository.getAll(business.id);
  const plainOrders = JSON.parse(JSON.stringify(orders));

  if (orders.length === 0) {
    return (
      <WelcomePage isWhatsAppConnected={containerData?.status === "connected"} />
    );
  }

  const orderTotalsPerDay: any[] = await orderRepository.getOrderTotalPerDay(business.id, 14);

  const totalRevenue = plainOrders.reduce((acc: number, order: any) => {
    return acc + (order.payment_status === 'paid' ? Number(order.total_amount) : 0);
  }, 0);

  const activeOrders = plainOrders.filter((order: any) => order.status === 'pending' || order.status === 'shipped').length;
  const totalOrdersValue = plainOrders.reduce((acc: number, order: any) => {
    return acc + Number(order.total_amount);
  }, 0);

  const ordersCountByDateInterval: any[] = await orderRepository.getProductOrdersByDateInterval(business.id, 14);
  const ordersCountByDayOfWeek: any[] = await orderRepository.getOrdersCountByDayOfWeek(business.id);
  const ordersToday: any[] = await orderRepository.getOrdersCountByDate(business.id, new Date());

  const outstandingOrders = plainOrders.filter(
    (order: any) => order.payment_status === 'unpaid' || order.payment_status === 'partial'
  );

  const contactRepository = new SupabaseContactRepository(supabase);

  const outstandingPayments = await Promise.all(
    outstandingOrders.map(async (order: any) => {
      let contact = null;
      if (order.contact_id) {
        const foundContact = await contactRepository.findById(business.id, order.contact_id);
        contact = foundContact ? JSON.parse(JSON.stringify(foundContact)) : null;
      }
      return {
        ...order,
        contact,
      };
    })
  );

  let recentConversations: any[] = [];
  if (containerData && containerData.status === "connected") {
    try {
      // Maintaining the same URL logic as in chats/layout.tsx
      let url = "http://192.168.1.64" + "/api/user" + "/" + business.id;
      const wappChatRepository = new GoWappChatRepository(url, "admin", "admin");
      const chats = await wappChatRepository.list(0, 10);
      recentConversations = JSON.parse(JSON.stringify(chats));
    } catch (error) {
      console.error("Failed to fetch recent conversations:", error);
    }
  }


  return (
    <Content className="p-4 md:p-8 bg-gray-50/50 dark:bg-zinc-950/50 scroll-auto overflow-y-auto">
      <PageHeader />

      <Greeting user={user} business={business} />

      <div className="flex flex-col gap-8">
        {/* Rewarding Stats Section */}
        <BusinessSummary
          totalRevenue={totalRevenue}
          totalOrders={plainOrders.length}
          activeOrders={activeOrders}
          totalOrdersValue={totalOrdersValue}
          ordersToday={ordersToday}
        />

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Business Analysis - Spans 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-md overflow-hidden bg-white dark:bg-zinc-900/50">
              <div className="p-6">
                <OrdersTotalValueChart data={orderTotalsPerDay} />
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-none shadow-md bg-white dark:bg-zinc-900/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-32 h-32 text-primary">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </div>
                <div className="p-6">
                  <MonthlyGoalCard currentRevenue={Math.floor(totalRevenue)} goalRevenue={10000} />
                </div>
              </Card>

              <OrderProductChart data={ordersCountByDateInterval} />

              <Card className="border-none shadow-md bg-white dark:bg-zinc-900/50 flex flex-col h-full max-h-[400px]">
                <div className="p-6 pb-2">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Actividad en Vivo
                  </h3>
                </div>
                <div className="px-6 pb-6 overflow-y-auto flex-1 scrollbar-hide">
                  <RecentOrdersFeed orders={plainOrders} />
                </div>
              </Card>
            </div>
          </div>


          {/* Side "Pulse" Column - Interaction Hub */}
          <div className="space-y-6">
            <OutstandingPaymentsCard payments={outstandingPayments} />
            <ActionRequiredCard activeOrders={activeOrders} />

            <Card className="border-none shadow-md bg-white dark:bg-zinc-900/50">
              <div className="p-6 pb-0 mb-2">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Conversaciones
                </h3>
                <p className="text-sm text-muted-foreground">Últimos mensajes de clientes</p>
              </div>

              <div className="p-6 pt-2">
                <RecentConversations chats={recentConversations} />
              </div>
            </Card>

          </div>
        </div>
      </div>
    </Content>
  );
}
