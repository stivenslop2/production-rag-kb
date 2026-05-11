interface ToolIndicatorProps {
  toolName: string;
  state: "running" | "done";
  query?: string;
}

const TOOL_LABELS: Record<string, { running: string; done: string }> = {
  searchKnowledge: {
    running: "Searching knowledge base",
    done: "Searched knowledge base",
  },
};

export function ToolIndicator({ toolName, state, query }: ToolIndicatorProps) {
  const labels = TOOL_LABELS[toolName] ?? {
    running: `Running ${toolName}`,
    done: `Ran ${toolName}`,
  };

  const label = state === "running" ? labels.running : labels.done;

  return (
    <div className="flex items-center gap-2 text-sm text-slate-500 my-2">
      {state === "running" && (
        <div className="w-3 h-3 rounded-full border-2 border-slate-300 border-t-[#1E40AF] animate-spin" />
      )}
      {state === "done" && (
        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      )}
      <span>{label}</span>
      {query && (
        <span className="text-slate-400">
          · <span className="font-mono text-xs">{query}</span>
        </span>
      )}
    </div>
  );
}