import { Geist, Geist_Mono } from "next/font/google";
import { messageRepository } from "@/repository/MessageRepository";
import { MessagesChart } from "@/components/messages-chart";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default async function Page() {
  const messagesPerDay = await messageRepository.getMessageCountPerDay();

  return (
    <div
      className={`${geistSans.className} ${geistMono.className} flex items-center justify-center font-sans `}
    >
      <main className="flex w-full max-w-3xl flex-col items-center py-32 px-16 sm:items-start">
        <h1 className="text-4xl font-bold">Welcome</h1>
        <div className="mt-8 w-full">
          <h2 className="text-2xl font-bold mb-4">Messages per Day</h2>
          <MessagesChart data={messagesPerDay} />
        </div>
      </main>
    </div>
  );
}
