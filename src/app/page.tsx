"use client";

import { useRef, useState } from "react";
import Markdown from "react-markdown";

export default function Home() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };
  const handleChat = async () => {
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
    <>
      <div ref={containerRef} className="p-4 flex-1 min-h-0 overflow-y-auto">
        <MarkdownRenderer>{response}</MarkdownRenderer>
      </div>
      <div className="shrink-0 flex gap-2 m-4">
        <textarea className="border rounded-md w-full p-1" onChange={e => setMessage(e.target.value)} rows={2} disabled={loading} />
        {loading ? <p>Loading...</p> : <button className="border rounded-md px-1" onClick={handleChat}>
          Send
        </button>}
      </div>
    </>
  );
}
