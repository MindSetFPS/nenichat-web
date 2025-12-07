import { Geist, Geist_Mono } from "next/font/google";
import { messageRepository } from "@/Nenichat/Messages/infra/persistance/MessageRepository";
import { MessagesChart } from "@/components/messages-chart";
import { PageHeader } from "@/components/ui/page-header";
import { OrderRepository } from "@/Nenichat/Orders/infra/persistance/OrderRepository";
import { pool } from "@/Nenichat/Shared/infra/persistance/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CreditCard, DollarSign, ShoppingBag } from "lucide-react";

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

  const totalRevenue = plainOrders.reduce((acc: number, order: any) => {
    return acc + (order.payment_status === 'paid' ? Number(order.total_amount) : 0);
  }, 0);

  const totalOrders = plainOrders.length;
  const activeOrders = plainOrders.filter((order: any) => order.status === 'processing' || order.status === 'shipped').length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;


  return (
    <>
      <PageHeader content={<h1 className="text-2xl font-bold">Welcome</h1>} />

      {plainOrders.length > 0 && (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-0 mt-4">
          <Card className="py-2 gap-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card className="py-2 gap-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">
                Orders
              </CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">+{totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                +180.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card className="py-2 gap-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">
                Active Orders
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">+{activeOrders}</div>
              <p className="text-xs text-muted-foreground">
                +19% from last month
              </p>
            </CardContent>
          </Card>
          <Card className="py-2 gap-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">
                Average Order Value
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">${avgOrderValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                +201 since last hour
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className={`${geistSans.className} ${geistMono.className} flex flex-col items-center justify-center font-sans mt-4`}>
        <h2 className="text-2xl font-bold">Mensajes recibidos</h2>
        <MessagesChart data={messagesPerDay} />
      </div>

    </>
  );
}
