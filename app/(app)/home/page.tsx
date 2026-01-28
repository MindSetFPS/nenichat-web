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

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Home',
}

const orderRepository = new OrderRepository(pool);

export default async function Page() {
  const messagesPerDay = await messageRepository.getMessageCountPerDay(14);
  const orders = await orderRepository.getAll();
  const plainOrders = JSON.parse(JSON.stringify(orders));
  const orderTotalsPerDay = await orderRepository.getOrderTotalPerDay(14);

  const totalRevenue = plainOrders.reduce((acc: number, order: any) => {
    return acc + (order.payment_status === 'paid' ? Number(order.total_amount) : 0);
  }, 0);

  const activeOrders = plainOrders.filter((order: any) => order.status === 'pending' || order.status === 'shipped').length;
  const totalOrdersValue = plainOrders.reduce((acc: number, order: any) => {
    return acc + Number(order.total_amount);
  }, 0);

  const ordersCountByDateInterval = await orderRepository.getProductOrdersByDateInterval(14);
  const ordersCountByDayOfWeek = await orderRepository.getOrdersCountByDayOfWeek();
  const ordersToday = await orderRepository.getOrdersCountByDate(new Date());

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
