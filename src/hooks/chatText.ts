"use client";

import { useEffect } from "react";

const CHAT_TEXT_KEY = "check-chat-text";

export function useChatText(inputRef: React.RefObject<HTMLTextAreaElement | null>) {
  useEffect(() => {
    const savedChatText = localStorage.getItem(CHAT_TEXT_KEY);
    if (savedChatText) inputRef.current!.value = savedChatText;

    const saveLocally = (e: Event) => {
      const text = (e.target as HTMLTextAreaElement).value.trim();
      if (text.length === 0)
        localStorage.removeItem(CHAT_TEXT_KEY);
      else
        localStorage.setItem(CHAT_TEXT_KEY, text);
    };
    inputRef.current!.addEventListener('change', saveLocally);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export default useChatText;
