import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default async function Page() {
  return (
    <div
      className={`${geistSans.className} ${geistMono.className} flex items-center justify-center font-sans `}
    >
      <main className="flex w-full max-w-3xl flex-col items-center py-32 px-16 sm:items-start">
        <h1 className="text-4xl font-bold">Welcome</h1>
      </main>
    </div>
  );
}
