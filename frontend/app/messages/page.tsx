import { MessagesTable } from "@/components/messages/messages-table";
import { contactRepository } from "@/Nenichat/Contacts/infra/persistance/ContactRepository";

export default async function Messages({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { page, pageSize } = await searchParams;

  let me = await contactRepository.findMe()
  me = JSON.parse(JSON.stringify(me))

  return (
    <MessagesTable
      page={page ? Number(page) : 1}
      pageSize={pageSize ? Number(pageSize) : 20}
      me={me!}
    />
  )
}