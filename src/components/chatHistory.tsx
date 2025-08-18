"use client";

import { useQuery, Authenticated, Unauthenticated } from "convex/react";
import { useShallow } from "zustand/shallow";
import { api } from "~/api";
import { useChatStore } from "@/contexts/chatStoreProvider";

const ChatItem = ({
  children, ...props
}: {
  children: React.ReactNode;
} & Omit<React.ComponentPropsWithRef<"li">, "className">) => (
  <li
    className="p-3 w-full rounded-md hover:bg-gray-800/60 hover:cursor-pointer"
    {...props}
  >{children}</li>
);

function ChatHistoryList() {
  const { startNewChat, setChat } = useChatStore(useShallow((s) => ({
    startNewChat: s.startNewChat,
    setChat: s.setChat
  })));
  const chats = useQuery(api.chats.getAll);

  return (
    <ul className="py-3 flex flex-col gap-1 w-full">
      <ChatItem onClick={startNewChat}>New Chat</ChatItem>
      {chats && chats.map((chat) => (
        <ChatItem key={chat._id} onClick={() => setChat(chat)}>{chat.title}</ChatItem>
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
