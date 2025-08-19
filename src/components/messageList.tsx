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
import { mergeClasses } from "@/utils/css";

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
    <div className={mergeClasses(className, "p-2 max-w-[80%] wrap-anywhere bg-gray-600 rounded-md self-end")} {...props}>
      <p>{body}</p>
      <span className="text-xs text-gray-400 float-end">{timestamp.toLocaleString()}</span>
    </div>
  );
}

function ModelMessage({
  streamId,
  scrollToBottom,
  className,
  ...props
}: {
  streamId: StreamId;
  scrollToBottom: () => void;
} & React.ComponentPropsWithRef<"div">) {

  const isDriven = true; // TODO: temporary value

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
    <div className={mergeClasses(className, "")} {...props}>
      <MarkdownRenderer>{text || "..."}</MarkdownRenderer>
      {status === "error" && (
        <div className="text-red-500 mt-2">Error loading response</div>
      )}
    </div>
  );
}

function MessageList({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  const chatId = useChatStore(useShallow((s) => s._id));
  const chatMessages = useQuery(api.messages.getAll, chatId === undefined ? "skip" : { chat: chatId });
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
    <div ref={containerRef} className={mergeClasses(className, "flex flex-col gap-2")} {...props}>
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
