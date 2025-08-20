"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useShallow } from "zustand/shallow";
import { useMutation } from "convex/react";
import { SendIcon } from "lucide-react";
import { api } from "~/api";
import type { Id } from "~/dataModel";
import { useChatStore } from "@/contexts/chatStoreProvider";
import { useSavedChatText, useChatTextKS } from "@/hooks/chatText";
import { LoadingIcon } from "@/components/icons";

const MessageList = dynamic(
  () => import('@/components/messageList'),
  { ssr: false }
);

export function ContinuedChat({ id }: { id: Id<"chats"> }) {
  const addDrivenStreamId = useChatStore(useShallow((s) => s.addDrivenStreamId));

  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useSavedChatText(inputRef);

  const continueChat = useMutation(api.chats.continueChat);
  const handleChat = useCallback(async () => {
    if (!inputRef.current || inputRef.current.value.length < 2) return;
    setLoading(true);

    try {
      const { responseStreamId } = await continueChat({ chat: id, body: inputRef.current.value });
      addDrivenStreamId(responseStreamId);
      inputRef.current.value = '';
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  }, [id, continueChat, setLoading, addDrivenStreamId]);
  useChatTextKS(inputRef, handleChat);

  return (
    <div className="flex-1 min-h-0 h-full flex flex-col justify-end gap-2">
      <MessageList className="p-4 flex-1 min-h-0 overflow-y-auto" />
      <div className="shrink-0 flex gap-2 m-4">
        <textarea
          name="input"
          className="border rounded-xl w-full p-1 resize-none"
          ref={inputRef}
          contentEditable={!loading}
          autoFocus={true}
        />
        <div className="flex justify-center items-center">
          <button role="button" className="flex justify-center items-center border rounded-full p-2" onClick={handleChat} disabled={loading}>
            {loading ? <LoadingIcon className="size-5" /> : <SendIcon className="size-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NewChat() {
  const router = useRouter();
  const startChat = useMutation(api.chats.startChat);
  const addDrivenStreamId = useChatStore(useShallow((s) => s.addDrivenStreamId));

  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useSavedChatText(inputRef);

  const handleChat = useCallback(async () => {
    if (!inputRef.current || inputRef.current.value.length < 2) return;
    setLoading(true);

    try {
      const { chatId, responseStreamId } = await startChat({ body: inputRef.current.value });
      addDrivenStreamId(responseStreamId);
      router.push(`/chat/${chatId}`);
      inputRef.current.value = '';
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  }, [router, startChat, setLoading, addDrivenStreamId]);
  useChatTextKS(inputRef, handleChat);

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-4">
      <p className="text-lg">{"What's on your mind today?"}</p>
      <div className="flex justify-center items-center w-full gap-2 px-4">
        <textarea
          className="border rounded-xl w-[70%] focus:w-full not-empty:w-full transition-[width] duration-500 p-1 resize-none"
          ref={inputRef}
          contentEditable={!loading}
        />
        <div className="flex justify-center items-center">
          <button role="button" className="flex justify-center items-center border rounded-full p-2" onClick={handleChat} disabled={loading}>
            {loading ? <LoadingIcon className="size-5" /> : <SendIcon className="size-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
