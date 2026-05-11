"use client";

interface EmptyStateProps {
  onSuggestionClick: (text: string) => void;
}

const SUGGESTIONS = [
  "What error code do I get when rate limited?",
  "How should I verify webhook signatures?",
  "Show me how to handle errors with the TypeScript SDK",
  "What are the API rate limits?",
];

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-12 h-12 rounded-2xl bg-[#1E40AF] flex items-center justify-center mb-5">
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>

      <h2 className="text-xl font-semibold text-slate-900 mb-2">
        Orbiill Docs Assistant
      </h2>
      <p className="text-slate-500 mb-8 text-center max-w-md">
        Ask me anything about the Orbiill API, SDK, webhooks, or product docs.
        I'll search the knowledge base and cite my sources.
      </p>

      <div className="w-full max-w-xl grid grid-cols-1 sm:grid-cols-2 gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onSuggestionClick(s)}
            className="text-left px-4 py-3 rounded-xl border border-slate-200 bg-white hover:border-[#1E40AF] hover:bg-slate-50 transition text-sm text-slate-700"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}