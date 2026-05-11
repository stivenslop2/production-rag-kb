"use client";

import { useState } from "react";

interface CitationPillProps {
  documentTitle: string;
  chunkIndex: number;
  content: string;
  relevanceScore: number;
}

export function CitationPill({
  documentTitle,
  chunkIndex,
  content,
  relevanceScore,
}: CitationPillProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-50 transition"
      >
        <div className="flex items-center gap-2 min-w-0">
          <svg className="w-4 h-4 text-[#1E40AF] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-sm font-medium text-slate-800 truncate">
            {documentTitle}
          </span>
          <span className="text-xs text-slate-400 flex-shrink-0">
            #{chunkIndex}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-slate-500 font-mono">
            {relevanceScore.toFixed(2)}
          </span>
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {expanded && (
        <div className="border-t border-slate-200 bg-slate-50 px-3 py-3">
          <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
            {content}
          </pre>
        </div>
      )}
    </div>
  );
}