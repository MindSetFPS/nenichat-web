import { messageRepository } from "@/Nenichat/Messages/infra/persistance/MessageRepository";
import { MessagesChart } from "@/components/home/messages-chart";
import { OrdersTotalValueChart } from "@/components/home/orders-total-chart";
import { OrderRepository } from "@/Nenichat/Orders/infra/persistance/OrderRepository";
import { pool } from "@/Nenichat/Shared/infra/persistance/db";
import { DailyOrdersChart } from "@/components/home/orders-pie-chart";
import { OrderProductChart } from "@/components/home/product-orders-chart";
import { HeaderAction } from "@/components/header-action";
import BusinessSummary from "@/components/home/business-summary";

export const dynamic = 'force-dynamic';
const orderRepository = new OrderRepository(pool);

export default async function Page() {
  const messagesPerDay = await messageRepository.getMessageCountPerDay(28);
  const orders = await orderRepository.getAll();
  const plainOrders = JSON.parse(JSON.stringify(orders));
  const orderTotalsPerDay = await orderRepository.getOrderTotalPerDay(28);

  const totalRevenue = plainOrders.reduce((acc: number, order: any) => {
    return acc + (order.payment_status === 'paid' ? Number(order.total_amount) : 0);
  }, 0);

  const activeOrders = plainOrders.filter((order: any) => order.status === 'pending' || order.status === 'shipped').length;
  const totalOrdersValue = plainOrders.reduce((acc: number, order: any) => {
    return acc + Number(order.total_amount);
  }, 0);

  const ordersCountByDateInterval = await orderRepository.getProductOrdersByDateInterval(28);
  const ordersToday = await orderRepository.getOrdersCountByDate(new Date());

  return (
    <>
      <HeaderAction>
        <h1 className="text-2xl font-bold">Buenos días</h1>
      </HeaderAction>
      <div className="flex flex-col overflow-y-auto gap-4">
        <BusinessSummary
          totalRevenue={totalRevenue}
          totalOrders={plainOrders.length}
          activeOrders={activeOrders}
          totalOrdersValue={totalOrdersValue}
        />
        <DailyOrdersChart data={ordersToday} />
        <MessagesChart data={messagesPerDay} />
        <OrdersTotalValueChart data={orderTotalsPerDay} />
        <OrderProductChart data={ordersCountByDateInterval} />
      </div>
    </>
  );
}
