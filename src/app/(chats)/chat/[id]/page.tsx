import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "~/api";
import { ContinuedChat } from "@/components/chat";
import ClientChatSync from "@/components/ClientChatSync";

export default async function Chat(
    { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { getToken } = await auth();

  const token = await getToken({ template: "convex" });
  if (token === null) notFound();

  const chat = await fetchQuery(api.chats.get, { chatId: id }, { token });
  return (
    <>
      <ContinuedChat id={chat._id} />
      <ClientChatSync chat={chat} />
    </>
  );
}
