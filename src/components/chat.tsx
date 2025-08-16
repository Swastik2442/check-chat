"use client";

import { useRef, useState } from "react";
import MarkdownRenderer from "@/components/markdownRenderer";
import { Loader2Icon, SendIcon } from "lucide-react";

export default function Chat() {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };
  const handleChat = async () => {
    if (loading || !messageRef.current) return;
    const message = messageRef.current.value.trim();
    if (message.length < 2) return;

    setLoading(true);
    setResponse('');

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      if (res.ok && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = JSON.parse(line.slice(6));
              setResponse((prev) => prev + data);
              scrollToBottom();
            }
          }
        }
      } else {
        setResponse(`Error: ${res.status} ${res.statusText}`);
      }
    } catch (err) {
      if (err instanceof Error)
        setResponse(`Error: ${err.message}`);
      else
        setResponse(`Error: ${err}`);
    }
    scrollToBottom();

    setLoading(false);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-2">
      <div ref={containerRef} className="p-4 flex-1 min-h-0 overflow-y-auto">
        <MarkdownRenderer>{response}</MarkdownRenderer>
      </div>
      <div className="shrink-0 flex gap-2 m-4">
        <textarea ref={messageRef} className="border rounded-xl w-full p-1 resize-none" contentEditable={!loading} />
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
