"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, Authenticated, Unauthenticated, useMutation } from "convex/react";
import { useShallow } from "zustand/shallow";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { api } from "~/api";
import { Doc } from "~/dataModel";
import { useChatStore } from "@/contexts/chatStoreProvider";

function ChatItem({
  chat, onDelete, ...props
}: {
  chat: Doc<"chats">;
  onDelete: () => void;
} & Omit<React.ComponentPropsWithRef<"li">, "className">) {
  const [editingTitle, setEditingTitle] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const setChatTitle = useMutation(api.chats.setChatTitle);
  const deleteChat = useMutation(api.chats.deleteChat);

  const editChatTitle = () => {
    const title = inputRef.current?.value.trim();
    if (title && title !== chat.title && /^[a-zA-Z0-9 \-_]{1,30}$/.test(title))
      setChatTitle({ chatId: chat._id, title });
    setEditingTitle(false);
  };

  return (
    <li
      className="p-3 w-full flex justify-between items-center rounded-md hover:bg-gray-800/60 hover:cursor-pointer group"
      title={chat.title}
      {...props}
    >
      {editingTitle ? <>
        <input
          type="text"
          ref={inputRef}
          defaultValue={chat.title}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              editChatTitle();
            } else if (e.key === "Escape") {
              setEditingTitle(false);
            }
          }}
          onBlur={editChatTitle}
          className="border-b border-gray-600 bg-transparent focus:outline-none"
          autoFocus
        />
      </> : <>
        <span className="text-ellipsis whitespace-nowrap overflow-hidden">{chat.title}</span>
        <div className="flex justify-between items-center gap-2">
          <button
            type="button"
            onClick={() => setEditingTitle(true)}
            title="Rename Chat"
            className="invisible group-hover:visible hover:cursor-pointer"
          >
            <PencilIcon className="size-5 text-gray-600" />
          </button>
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
        </div>
      </>}
    </li>
  );
}

function ChatHistoryList() {
  const { startNewChat, setChat } = useChatStore(useShallow((s) => ({
    startNewChat: s.startNewChat,
    setChat: s.setChat
  })));
  const chats = useQuery(api.chats.getAll);
  const router = useRouter();

  const handleNewChat = () => {
    startNewChat();
    router.replace("/");
  };

  return (
    <ul className="py-3 flex flex-col gap-1 w-full">
      <li
        onClick={handleNewChat}
        title="Start a new Chat"
        className="p-3 w-full rounded-md hover:bg-gray-800/60 hover:cursor-pointer"
      >
        New Chat
      </li>
      {chats && chats.map((chat) => (
        <ChatItem key={chat._id} chat={chat} onClick={() => {
          setChat(chat);
          router.replace(`/chat/${chat._id}`);
        }} onDelete={handleNewChat} />
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
        <p className="text-sm text-foreground/70 p-3">Sign in to start saving your AI Chats</p>
      </Unauthenticated>
    </div>
  );
}

export default ChatHistory;
