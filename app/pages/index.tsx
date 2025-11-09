import { Geist, Geist_Mono } from "next/font/google";
import { contactRepository } from "@/repository/ContactRepository";
import { IContact } from "@/repository/IContact";
import { GetServerSideProps } from "next";
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface HomeProps {
  contacts: IContact[];
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async (context) => {
  const repo = contactRepository;
  const contacts = await repo.getContacts(0, 10);

  return {
    props: {
      contacts: JSON.parse(JSON.stringify(contacts)),
    },
  };
};

export default function Home({ contacts }: HomeProps) {
  return (
    <div
      className={`${geistSans.className} ${geistMono.className} flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black`}
    >
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">hello</div>
        {contacts.map((contact) => (
          <ul key={contact.id.toString()} className="p-4 border-b w-full">
            <li className="text-lg font-semibold">{contact.pushname || "No Name"}</li>
            <li className="text-sm text-gray-500">{contact.phone_number}</li>
          </ul>
        ))}




        <Dialog>
          <form>
            <DialogTrigger asChild>
              <Button variant="outline">Open Dialog</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit profile</DialogTitle>
                <DialogDescription>
                  Make changes to your profile here. Click save when you&apos;re
                  done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="name-1">Name</Label>
                  <Input id="name-1" name="name" defaultValue="Pedro Duarte" />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="username-1">Username</Label>
                  <Input id="username-1" name="username" defaultValue="@peduarte" />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </form>
        </Dialog>


      </main>
    </div>
  );
}
