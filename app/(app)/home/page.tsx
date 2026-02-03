import { messageRepository } from "@/Nenichat/Messages/infra/persistance/MessageRepository";
import { MessagesChart } from "@/components/home/messages-chart";
import { OrdersTotalValueChart } from "@/components/home/orders-total-chart";
import { OrderRepository } from "@/Nenichat/Orders/infra/persistance/OrderRepository";
import { pool } from "@/Nenichat/Shared/infra/persistance/db";
import { DailyOrdersChart } from "@/components/home/orders-pie-chart";
import { OrderProductChart } from "@/components/home/product-orders-chart";
import BusinessSummary from "@/components/home/business-summary";
import { OrdersByDayChart } from "@/components/contacts/orders-by-day-chart";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { PageHeader } from "@/components/ui/page-header";
import Content from "@/components/layout/content";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CreateBusinessSection } from "@/components/forms/create-business-section";
import { requireAuth } from "@/lib/auth";

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Home',
}

const orderRepository = new OrderRepository(pool);

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

  const messagesPerDay: any[] = []; //await messageRepository.getMessageCountPerDay(14);
  const orders: any[] = []; //await orderRepository.getAll();
  const plainOrders = JSON.parse(JSON.stringify(orders));
  const orderTotalsPerDay: any[] = []; //await orderRepository.getOrderTotalPerDay(14);

  const totalRevenue = plainOrders.reduce((acc: number, order: any) => {
    return acc + (order.payment_status === 'paid' ? Number(order.total_amount) : 0);
  }, 0);

  const activeOrders = plainOrders.filter((order: any) => order.status === 'pending' || order.status === 'shipped').length;
  const totalOrdersValue = plainOrders.reduce((acc: number, order: any) => {
    return acc + Number(order.total_amount);
  }, 0);

  const ordersCountByDateInterval: any[] = []; //await orderRepository.getProductOrdersByDateInterval(14);
  const ordersCountByDayOfWeek: any[] = []; //await orderRepository.getOrdersCountByDayOfWeek();
  const ordersToday: any[] = []; //await orderRepository.getOrdersCountByDate(new Date());

  return (
    <Content className="p-4 scroll-auto overflow-y-auto">
      <PageHeader title="Buenos días" />
      <div className="flex flex-col gap-4">
        <BusinessSummary
          totalRevenue={totalRevenue}
          totalOrders={plainOrders.length}
          activeOrders={activeOrders}
          totalOrdersValue={totalOrdersValue}
        />
        <DailyOrdersChart data={ordersToday} />
        <OrdersByDayChart data={ordersCountByDayOfWeek} />
        <MessagesChart data={messagesPerDay} />
        <OrdersTotalValueChart data={orderTotalsPerDay} />
        <OrderProductChart data={ordersCountByDateInterval} />
      </div>
    </Content>
  );
}
