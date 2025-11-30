import { MessagesTable } from "@/components/messages/messages-table";
import { contactRepository } from "@/Nenichat/Contacts/infra/persistance/ContactRepository";
import { PageHeader } from "@/components/ui/page-header";

export default async function Messages({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { page, pageSize } = await searchParams;

  let me = await contactRepository.findMe()
  me = JSON.parse(JSON.stringify(me))

  return (
    <>
      <PageHeader content={<h1 className="text-2xl font-bold">Messages</h1>} />
      <MessagesTable
        page={page ? Number(page) : 1}
        pageSize={pageSize ? Number(pageSize) : 20}
        me={me!}
      />
    </>
  )
}