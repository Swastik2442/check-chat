"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNormalChat = async () => {
    setLoading(true);
    setResponse('');

    try {
      const res = await fetch("/api/chat/normal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      if (res.ok) {
        const data = await res.json();
        setResponse(data.response);
      } else {
        setResponse(`Error: ${res.status} ${res.statusText}`);
      }
    } catch (err) {
      if (err instanceof Error)
        setResponse(`Error: ${err.message}`);
      else
        setResponse(`Error: ${err}`);
    }

    setLoading(false);
  };
  const handleStreamChat = async () => {
    setLoading(true);
    setResponse('');

    try {
      const res = await fetch("/api/chat/stream", {
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

    setLoading(false);
  };

  return (
    <main>
      <div className="w-full text-center border-b py-2 text-xl">check-chat</div>
      <div className="flex flex-col w-screen p-4 gap-2">
        <textarea className="border rounded-md p-1" onChange={e => setMessage(e.target.value)} rows={4} disabled={loading} />
        {loading ? <p>Loading...</p> : <div className="flex gap-2">
          <button className="border px-1" onClick={handleNormalChat}>
            Send Normal
          </button>
          <button className="border px-1" onClick={handleStreamChat}>
            Send Stream
          </button>
        </div>}
        <textarea className="border rounded-md p-1" value={response} rows={4} readOnly />
      </div>
    </main>
  );
}
