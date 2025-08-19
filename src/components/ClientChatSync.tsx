"use client";

import { useEffect } from "react";
import { useShallow } from "zustand/shallow";
import { Doc } from "~/dataModel";
import { useChatStore } from "@/contexts/chatStoreProvider";

function ClientChatSync({ chat }: { chat: Doc<"chats"> | null }) {
  const { startNewChat, setChat } = useChatStore(useShallow((s) => ({
    startNewChat: s.startNewChat,
    setChat: s.setChat
  })));

  useEffect(() => {
    if (chat === null)
      startNewChat();
    else
      setChat(chat);
  }, [chat, startNewChat, setChat]);

  return null;
}

export default ClientChatSync;
