"use client";

import { useState, KeyboardEvent } from "react";

interface ChatInputProps {
  onSubmit: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSubmit, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-slate-200 bg-white p-4">
      <div className="mx-auto max-w-3xl">
        <div className="flex gap-2 items-end rounded-2xl border border-slate-300 bg-white px-4 py-3 focus-within:border-[#1E40AF] focus-within:ring-2 focus-within:ring-[#1E40AF]/20 transition">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about the Orbiill docs..."
            rows={1}
            disabled={disabled}
            className="flex-1 resize-none bg-transparent outline-none text-slate-900 placeholder:text-slate-400 max-h-32 caret-[#1E40AF]"
            style={{ color: "#0F172A" }}
          />
          <button
            onClick={handleSubmit}
            disabled={disabled || !value.trim()}
            className="rounded-lg bg-[#1E40AF] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#1E3A8A] disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}