"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef } from "react";
import { ChatMessage } from "../features/chat/components/ChatMessage";
import { ChatInput } from "../features/chat/components/ChatInput";

export default function Home() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isBusy = status === "submitted" || status === "streaming";

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-lg font-semibold text-slate-900">
            Orbiill Docs Assistant
          </h1>
          <p className="text-xs text-slate-500">
            RAG over Orbiill documentation · hybrid search + Cohere rerank
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-6 space-y-6">
          {messages.map((m) => (
            <ChatMessage key={m.id} message={m} />
          ))}
          <div ref={bottomRef} />
        </div>
      </main>

      <ChatInput
        onSubmit={(text) => sendMessage({ text })}
        disabled={isBusy}
      />
    </div>
  );
}