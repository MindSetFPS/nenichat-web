"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { IMessageWithSender } from "@/dto/IMessageWithSender";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pagination } from "@/components/ui/pagination";
import { useRouter } from "next/navigation";
import { EmptyList } from "@/components/empty-list";
import { MessageSquare } from "lucide-react";

interface IMessageResponse {
  data: IMessageWithSender[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function MessagesPage() {
  const [response, setResponse] = useState<IMessageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [columnVisibility, setColumnVisibility] = useState({
    id: true,
    sender: true,
    chat: true,
    message: true,
    repliedTo: false,
    quotedMessage: false,
    date: true,
  });

  const router = useRouter();

  const fetchMessages = async (page: number, size: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/messages?page=${page}&pageSize=${size}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      const data: IMessageResponse = await response.json();
      setResponse(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(page, pageSize);
  }, [page, pageSize]);


  const getSenderName = (message: IMessageWithSender) => {
    if (message.sender) {
      return message.sender.contact_name || message.sender.pushname || message.sender.username || message.sender.phone_number || message.sender.lid;
    }
    return String(message.sender_id);
  }

  return (
    <div className="flex-1 space-y-4 px-4 md:p-8 md:pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Messages</h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">

            <DropdownMenuCheckboxItem
              checked={columnVisibility.id}
              onCheckedChange={(value) =>
                setColumnVisibility((prev) => ({ ...prev, id: value }))
              }
            >
              id
            </DropdownMenuCheckboxItem>

            <DropdownMenuCheckboxItem
              checked={columnVisibility.sender}
              onCheckedChange={(value) =>
                setColumnVisibility((prev) => ({ ...prev, sender: value }))
              }
            >
              Sender
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.chat}
              onCheckedChange={(value) =>
                setColumnVisibility((prev) => ({ ...prev, chat: value }))
              }
            >
              Chat
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.message}
              onCheckedChange={(value) =>
                setColumnVisibility((prev) => ({ ...prev, message: value }))
              }
            >
              Message
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.repliedTo}
              onCheckedChange={(value) =>
                setColumnVisibility((prev) => ({ ...prev, repliedTo: value }))
              }
            >
              Replied To
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.quotedMessage}
              onCheckedChange={(value) =>
                setColumnVisibility((prev) => ({
                  ...prev,
                  quotedMessage: value,
                }))
              }
            >
              Quoted Message
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={columnVisibility.date}
              onCheckedChange={(value) =>
                setColumnVisibility((prev) => ({ ...prev, date: value }))
              }
            >
              Date
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isLoading ? (

        <Spinner className="h-5 w-5" />

      ) : (<></>)}

      {response?.data.length === 0 ? (
        <EmptyList
          title="No messages found"
          description="There are no messages to display at the moment."
          icon={<MessageSquare className="w-12 h-12 text-primary" />}
          action={<Button onClick={() => router.push("/chats")}>Create Chat</Button>}
        />
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {columnVisibility.id && <TableHead>id</TableHead>}
                  {columnVisibility.sender && <TableHead>Sender</TableHead>}
                  {columnVisibility.chat && <TableHead>Chat</TableHead>}
                  {columnVisibility.message && <TableHead className="max-w-24">Message</TableHead>}
                  {columnVisibility.repliedTo && (
                    <TableHead>Replied To</TableHead>
                  )}
                  {columnVisibility.quotedMessage && (
                    <TableHead>Quoted Message</TableHead>
                  )}
                  {columnVisibility.date && <TableHead>Date</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {response?.data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={Object.values(columnVisibility).filter(Boolean).length}
                      className="h-24 text-center"
                    >
                      No messages found.
                    </TableCell>
                  </TableRow>
                ) : (
                  response?.data.map((message) => (
                    <TableRow
                      className="cursor-pointer"
                      onClick={() => router.push(`/chats/${message.chat_id}`)}
                      key={message.id}>
                      {columnVisibility.id && (
                        <TableCell>{message.sender?.id}</TableCell>
                      )}
                      { }
                      {columnVisibility.sender && (
                        <TableCell>{getSenderName(message)}</TableCell>
                      )}
                      {columnVisibility.chat && (
                        <TableCell>{String(message.chat_id)}</TableCell>
                      )}
                      {columnVisibility.message && (
                        <TableCell className="max-w-full wrap-break-word whitespace-pre-wrap">{message.text_content}</TableCell>
                      )}
                      {columnVisibility.repliedTo && (
                        <TableCell>
                          {message.replied_to_message_id}
                        </TableCell>
                      )}
                      {columnVisibility.quotedMessage && (
                        <TableCell>{message.quoted_message_text}</TableCell>
                      )}
                      {columnVisibility.date && (
                        <TableCell>
                          {new Date(message.created_at).toLocaleString()}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <Pagination
            pageSize={Number(pageSize)}
            page={page}
            setPage={setPage}
            setPageSize={setPageSize}
            totalPages={response?.totalPages || 0}
          />

        </>
      )}
    </div>
  );
}
