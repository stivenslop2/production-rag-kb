import { CitationPill } from "./CitationPill";

interface Chunk {
  id: string;
  documentTitle: string;
  chunkIndex: number;
  content: string;
  relevanceScore: number;
}

interface CitationsProps {
  chunks: Chunk[];
}

export function Citations({ chunks }: CitationsProps) {
  if (chunks.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-slate-200">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-2">
        Sources
      </div>
      <div className="space-y-1.5">
        {chunks.map((chunk) => (
          <CitationPill
            key={chunk.id}
            documentTitle={chunk.documentTitle}
            chunkIndex={chunk.chunkIndex}
            content={chunk.content}
            relevanceScore={chunk.relevanceScore}
          />
        ))}
      </div>
    </div>
  );
}