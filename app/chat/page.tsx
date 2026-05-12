"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { ChatMessage } from "@/features/chat/components/ChatMessage";
import { ChatInput } from "@/features/chat/components/ChatInput";
import { EmptyState } from "@/features/chat/components/EmptyState";

export default function ChatPage() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isBusy = status === "submitted" || status === "streaming";
  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-screen bg-surface-muted">
      <header className="border-b border-border bg-surface px-6 py-4">
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-ink">
              Orbiill Docs Assistant
            </h1>
            <p className="text-xs text-ink-muted">
              RAG over Orbiill documentation · hybrid search + Cohere rerank
            </p>
          </div>
          <Link
            href="/"
            className="text-sm text-ink-muted hover:text-brand-600 transition-colors"
          >
            <span aria-hidden>&larr;</span> Landing
          </Link>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-6 space-y-6">
          {isEmpty ? (
            <EmptyState onSuggestionClick={(text) => sendMessage({ text })} />
          ) : (
            messages.map((m) => <ChatMessage key={m.id} message={m} />)
          )}
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
