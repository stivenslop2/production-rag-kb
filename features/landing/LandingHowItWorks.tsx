const NODE_TONES = {
  neutral: "bg-surface border-border text-ink",
  accent: "bg-brand-50 border-brand-200 text-brand-900",
  strong: "bg-ink border-ink text-white",
  muted: "bg-surface-subtle border-border text-ink-muted",
} as const;

interface ArchNodeProps {
  label: string;
  sub: string;
  tone: keyof typeof NODE_TONES;
}

function ArchNode({ label, sub, tone }: ArchNodeProps) {
  return (
    <div className={`rounded-xl border px-4 py-3 ${NODE_TONES[tone]}`}>
      <p className="text-sm font-semibold">{label}</p>
      <p
        className={`text-xs mt-0.5 font-mono ${
          tone === "strong" ? "text-brand-200" : "text-ink-soft"
        }`}
      >
        {sub}
      </p>
    </div>
  );
}

function ArchArrow() {
  return (
    <div className="flex justify-center text-ink-soft" aria-hidden>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M7 1v12M3 9l4 4 4-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function LandingHowItWorks() {
  return (
    <section className="mx-auto max-w-4xl px-6 pb-20">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          How it works
        </h2>
        <p className="text-sm text-ink-muted max-w-2xl">
          A single tool call (<span className="font-mono">searchKnowledge</span>)
          runs the full retrieval pipeline: hybrid search, RRF fusion, Cohere
          rerank, and confidence classification — returning cited chunks the
          model can answer from.{" "}
          <a
            href="https://github.com/stivenslop2/production-rag-kb#readme"
            target="_blank"
            rel="noreferrer"
            className="text-brand-600 hover:text-brand-700 underline"
          >
            Read the full README
          </a>
          .
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-gradient-to-b from-surface-subtle to-surface p-6 sm:p-8 space-y-3">
        <ArchNode
          label="Browser"
          sub="app/chat · features/chat/components/*"
          tone="neutral"
        />
        <ArchArrow />
        <ArchNode
          label="Streaming chat route"
          sub="app/api/chat/route.ts · Vercel AI SDK · Claude Haiku 4.5"
          tone="accent"
        />
        <ArchArrow />
        <ArchNode
          label="searchKnowledge tool"
          sub="features/chat/searchKnowledge.ts · Zod-validated input"
          tone="accent"
        />
        <ArchArrow />
        <div className="grid sm:grid-cols-2 gap-3">
          <ArchNode
            label="BM25 search"
            sub="Postgres tsvector"
            tone="neutral"
          />
          <ArchNode
            label="Vector search"
            sub="pgvector · text-embedding-3-small"
            tone="neutral"
          />
        </div>
        <ArchArrow />
        <ArchNode
          label="RRF fusion (k=60) → Cohere rerank"
          sub="features/retrieval/searchPipeline.ts"
          tone="strong"
        />
        <ArchArrow />
        <ArchNode
          label="Supabase Postgres"
          sub="documents · chunks · embeddings"
          tone="muted"
        />
      </div>
    </section>
  );
}
