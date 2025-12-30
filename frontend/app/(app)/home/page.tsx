import { Geist, Geist_Mono } from "next/font/google";
import { messageRepository } from "@/Nenichat/Messages/infra/persistance/MessageRepository";
import { MessagesChart } from "@/components/home/messages-chart";
import { OrdersTotalChart } from "@/components/home/orders-total-chart";
import { OrderRepository } from "@/Nenichat/Orders/infra/persistance/OrderRepository";
import { pool } from "@/Nenichat/Shared/infra/persistance/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CreditCard, DollarSign, ShoppingBag } from "lucide-react";
import { OrdersPieChart } from "@/components/home/orders-pie-chart";
import { HeaderAction } from "@/components/header-action";
import BusinessSummary from "@/components/home/business-summary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const dynamic = 'force-dynamic';
const orderRepository = new OrderRepository(pool);

export default async function Page() {
  const messagesPerDay = await messageRepository.getMessageCountPerDay();
  const orders = await orderRepository.getAll();
  const plainOrders = JSON.parse(JSON.stringify(orders));
  const orderTotalsPerDay = await orderRepository.getOrderTotalPerDay();

  const totalRevenue = plainOrders.reduce((acc: number, order: any) => {
    return acc + (order.payment_status === 'paid' ? Number(order.total_amount) : 0);
  }, 0);

  const totalOrders = plainOrders.length;
  const activeOrders = plainOrders.filter((order: any) => order.status === 'pending' || order.status === 'shipped').length;
  const totalOrdersValue = plainOrders.reduce((acc: number, order: any) => {
    return acc + Number(order.total_amount);
  }, 0);

  const today = new Date();
  const ordersToday = await orderRepository.getOrdersCountByDate(today);

  return (
    <>
      <HeaderAction>
        <h1 className="text-2xl font-bold">Buenos días</h1>
      </HeaderAction>
      <div className="flex flex-col overflow-y-auto gap-4">
        {plainOrders.length > 0 && (
          <BusinessSummary
            totalRevenue={totalRevenue}
            totalOrders={totalOrders}
            activeOrders={activeOrders}
            totalOrdersValue={totalOrdersValue}
          />
        )}

        <OrdersPieChart data={ordersToday} />

        <div className={`${geistSans.className} ${geistMono.className} flex flex-col items-center justify-center font-sans mt-4`}>
          <h2 className="text-2xl font-bold">Mensajes recibidos</h2>
          <MessagesChart data={messagesPerDay} />
        </div>

        {orderTotalsPerDay.length > 0 && (
          <div className={`${geistSans.className} ${geistMono.className} flex flex-col items-center justify-center font-sans mt-8`}>
            <h2 className="text-2xl font-bold">Valor de ventas diario</h2>
            <OrdersTotalChart data={orderTotalsPerDay} />
          </div>
        )}

      </div>

    </>
  );
}
