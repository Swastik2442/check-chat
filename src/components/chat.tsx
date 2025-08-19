"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useShallow } from "zustand/shallow";
import { useMutation } from "convex/react";
import { Loader2Icon, SendIcon } from "lucide-react";
import { api } from "~/api";
import type { Id } from "~/dataModel";
import { useChatStore } from "@/contexts/chatStoreProvider";

const MessageList = dynamic(
  () => import('@/components/messageList'),
  { ssr: false }
);

export function ContinuedChat({ id }: { id: Id<"chats"> }) {
  const { currentMessage, setCurrentMessage, addDrivenStreamId } = useChatStore(useShallow((s) => ({
    currentMessage: s.currentMessage,
    setCurrentMessage: s.setCurrentMessage,
    addDrivenStreamId: s.addDrivenStreamId
  })));

  const [loading, setLoading] = useState(false);

  const continueChat = useMutation(api.chats.continueChat);
  const handleChat = async () => {
    if (currentMessage.length < 2) return;
    const message = currentMessage;

    setLoading(true);
    setCurrentMessage('');

    const streamId = await continueChat({ chat: id, body: message });
    addDrivenStreamId(streamId);

    setLoading(false);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-2">
      <MessageList className="p-4 flex-1 min-h-0 overflow-y-auto" />
      <div className="shrink-0 flex gap-2 m-4">
        <textarea
          autoFocus={true}
          className="border rounded-xl w-full p-1 resize-none"
          value={currentMessage}
          onChange={e => setCurrentMessage(e.target.value)}
          contentEditable={!loading}
        />
        <div className="flex justify-center items-center">
          {loading ? <Loader2Icon className="size-5" /> : <>
            <button role="button" className="flex justify-center items-center border rounded-full p-2" onClick={handleChat}>
              <SendIcon className="size-5" />
            </button>
          </>}
        </div>
      </div>
    </div>
  );
}

export default function NewChat() {
  const { message, setMessage, setChat } = useChatStore(useShallow((s) => ({
    message: s.currentMessage,
    setChat: s.setChat,
    setMessage: s.setCurrentMessage
  })));
  const startChat = useMutation(api.chats.startChat);
  const router = useRouter();

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState(false);

  const handleChat = async () => {
    if (message.length < 2) return;

    setLoading(true);

    const chatId = await startChat({ body: message });
    setChat({ // Temporary Values, will get updated
      _id: chatId,
      _creationTime: new Date().getTime(),
      title: "New Chat",
      user: "me"
    });
    router.push(`/chat/${chatId}`);

    setMessage('');
    setLoading(false);
  };

  // TODO: Add a way such that on pressing Enter when textarea is in focus, startChat. When Shift + Enter, enter new line

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-4">
      <p className="text-lg">{"What's on your mind today?"}</p>
      <div className="flex justify-center items-center w-full gap-2 px-4">
        <textarea
          className="border rounded-xl w-[70%] focus:w-full not-empty:w-full transition-[width] duration-500 p-1 resize-none"
          ref={inputRef}
          defaultValue={message}
          onChange={e => setMessage(e.target.value)}
          contentEditable={!loading}
          autoFocus={true}
        />
        <div className="flex justify-center items-center">
          {loading ? <Loader2Icon className="size-5" /> : <>
            <button role="button" className="flex justify-center items-center border rounded-full p-2" onClick={handleChat}>
              <SendIcon className="size-5" />
            </button>
          </>}
        </div>
      </div>
    </div>
  );
}
