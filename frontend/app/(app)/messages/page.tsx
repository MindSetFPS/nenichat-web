import { MessagesTable } from "@/components/messages/messages-table";
import { contactRepository } from "@/Nenichat/Contacts/infra/persistance/ContactRepository";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable } from "@/components/data-table";
import { messageRepository } from "@/Nenichat/Messages/infra/persistance/MessageRepository";
import { columns } from "@/components/messages/table/columns";

export default async function Messages({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { page, pageSize } = await searchParams;

  let me = await contactRepository.findMe()
  let messages = await messageRepository.listWithSender(1, 30)
  me = JSON.parse(JSON.stringify(me))

  messages = JSON.parse(JSON.stringify(messages))

  return (
    <>
      <PageHeader content={<h1 className="text-2xl font-bold">Messages</h1>} />
      {/* <MessagesTable
        page={page ? Number(page) : 1}
        pageSize={pageSize ? Number(pageSize) : 20}
        me={me!}
      /> */}

      <DataTable
        columns={columns}
        visibleColumns={{
          "id": false,
          "sender": true,
          "text_content": true,
          "created_at": true,
        }}
        data={messages}
      />
    </>
  )
}