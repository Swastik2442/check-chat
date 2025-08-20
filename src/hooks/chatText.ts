"use client";

import { useEffect } from "react";

const CHAT_TEXT_KEY = "check-chat-text";

type TextAreaElementRef = React.RefObject<HTMLTextAreaElement | null>;

export function useSavedChatText(inputRef: TextAreaElementRef) {
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
  }, [inputRef]);
}

export function useChatTextKS(inputRef: TextAreaElementRef, sendText: () => void) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!inputRef.current
      || document.activeElement !== inputRef.current
      || e.key !== "Enter"
      || e.shiftKey) return;

      e.preventDefault();
      sendText();
    };

    document.addEventListener("keydown", handleKeyPress)
    return () => document.removeEventListener("keydown", handleKeyPress)
  }, [inputRef, sendText]);
}
