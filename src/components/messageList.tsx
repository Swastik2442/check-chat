"use client";

import { type ComponentPropsWithoutRef, useCallback, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import type { StreamId } from "@convex-dev/persistent-text-streaming";
import { useStream } from "@convex-dev/persistent-text-streaming/react";
import { useShallow } from "zustand/shallow";
import { api } from "~/api";
import { useChatStore } from "@/contexts/chatStoreProvider";
import MarkdownRenderer from "@/components/markdownRenderer";
import { getConvexSiteUrl } from "@/utils/convex";

function UserMessage({
  body,
  timestamp,
  className,
  ...props
}: {
  body: string;
  timestamp: Date;
} & React.ComponentPropsWithRef<"div">) {
  return (
    <div className="p-2 bg-gray-600 rounded-md float-end" {...props}>
      <p>{body}</p>
      <span className="text-xs text-gray-400 float-end">{timestamp.toLocaleString()}</span>
    </div>
  );
}

function ModelMessage({
  streamId,
  scrollToBottom,
  ...props
}: {
  streamId: StreamId;
  scrollToBottom: () => void;
} & React.ComponentPropsWithRef<"div">) {

  const isDriven = false; // TODO: temporary value

  const { text, status } = useStream(
    api.streaming.getStreamBody,
    new URL(`${getConvexSiteUrl()}/chat-stream`),
    isDriven,
    streamId
  );

  useEffect(() => {
    if (!text) return;
    scrollToBottom();
  }, [text, scrollToBottom]);

  return (
    <div {...props}>
      <MarkdownRenderer>{text || "..."}</MarkdownRenderer>
      {status === "error" && (
        <div className="text-red-500 mt-2">Error loading response</div>
      )}
    </div>
  );
}

function MessageList(props: ComponentPropsWithoutRef<"div">) {
  const chatId = useChatStore(useShallow((s) => s._id));
  if (!chatId) throw new Error("Unknown Chat");

  const chatMessages = useQuery(api.messages.getAll, { chat: chatId });
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  return (
    <div ref={containerRef} {...props}>
      {chatMessages && chatMessages.map((msg) => (msg.by === "llm") ? (
        <ModelMessage
          key={msg._id}
          streamId={msg.bodyOrStreamId as StreamId}
          scrollToBottom={scrollToBottom}
        />
      ) : (
        <UserMessage
          key={msg._id}
          body={msg.bodyOrStreamId}
          timestamp={new Date(msg._creationTime)}
        />
      ))}
    </div>
  );
}

export default MessageList;
