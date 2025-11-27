import { Geist, Geist_Mono } from "next/font/google";
import { messageRepository } from "@/Nenichat/Messages/infra/persistance/MessageRepository";
import { MessagesChart } from "@/components/messages-chart";
import { PageHeader } from "@/components/ui/page-header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const dynamic = 'force-dynamic';

export default async function Page() {
  const messagesPerDay = await messageRepository.getMessageCountPerDay();

  return (
    <>
      <PageHeader content={<h1 className="text-2xl font-bold">Welcome</h1>} />
      <div className={`${geistSans.className} ${geistMono.className} flex flex-col items-center justify-center font-sans `}>
        <h2 className="text-2xl font-bold">Messages per Day</h2>
        <MessagesChart data={messagesPerDay} />
      </div>
    </>
  );
}
