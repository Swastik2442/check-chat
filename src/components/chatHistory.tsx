"use client";

import { useQuery, Authenticated, Unauthenticated, useMutation } from "convex/react";
import { useShallow } from "zustand/shallow";
import { api } from "~/api";
import { Doc } from "~/dataModel";
import { useChatStore } from "@/contexts/chatStoreProvider";
import { Trash2Icon } from "lucide-react";

function ChatItem({
  chat, onDelete, ...props
}: {
  chat: Doc<"chats">;
  onDelete: () => void;
} & Omit<React.ComponentPropsWithRef<"li">, "className">) {
  const deleteChat = useMutation(api.chats.deleteChat);
  return (
    <li
      className="p-3 w-full flex justify-between items-center rounded-md hover:bg-gray-800/60 hover:cursor-pointer group"
      title={chat.title}
      {...props}
    >
      <span>{chat.title}</span>
      <button
        type="button"
        onClick={() => {
          onDelete();
          deleteChat({ chatId: chat._id });
        }}
        title="Delete Chat"
        className="invisible group-hover:visible hover:cursor-pointer"
      >
        <Trash2Icon className="size-5 text-gray-600" />
      </button>
    </li>
  );
}

function ChatHistoryList() {
  const { startNewChat, setChat } = useChatStore(useShallow((s) => ({
    startNewChat: s.startNewChat,
    setChat: s.setChat
  })));
  const chats = useQuery(api.chats.getAll);

  return (
    <ul className="py-3 flex flex-col gap-1 w-full">
      <li
        onClick={startNewChat}
        title="Start a new Chat"
        className="p-3 w-full rounded-md hover:bg-gray-800/60 hover:cursor-pointer"
      >
        New Chat
      </li>
      {chats && chats.map((chat) => (
        <ChatItem key={chat._id} chat={chat} onClick={() => setChat(chat)} onDelete={startNewChat} />
      ))}
    </ul>
  );
}

function ChatHistory() {
  return (
    <div className="p-1">
      <h4 className="text-md p-3 border-b">History</h4>
      <Authenticated>
        <ChatHistoryList />
      </Authenticated>
      <Unauthenticated>
        <p className="text-sm text-foreground/70">Sign in to start saving your AI Chats</p>
      </Unauthenticated>
    </div>
  );
}

export default ChatHistory;
