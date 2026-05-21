interface StepCardProps {
  index: number;
  label: string;
  description: string;
  meta: string;
  tags: string[];
  emphasis?: "default" | "primary";
}

function StepCard({
  index,
  label,
  description,
  meta,
  tags,
  emphasis = "default",
}: StepCardProps) {
  const isPrimary = emphasis === "primary";
  return (
    <div className="relative flex gap-4">
      <div className="flex flex-col items-center" aria-hidden>
        <div
          className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold tabular-nums shadow-sm ${
            isPrimary
              ? "border-brand-500 bg-brand-500 text-white"
              : "border-border-strong bg-surface text-ink"
          }`}
        >
          {index}
        </div>
      </div>

      <div
        className={`group relative flex-1 rounded-xl border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${
          isPrimary
            ? "border-brand-200 ring-1 ring-brand-100"
            : "border-border"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-ink">{label}</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">
              {description}
            </p>
          </div>
        </div>

        <p className="mt-3 font-mono text-[11px] text-ink-soft">{meta}</p>

        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span
                key={t}
                className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                  isPrimary
                    ? "border-brand-200 bg-brand-50 text-brand-700"
                    : "border-border bg-surface-subtle text-ink-muted"
                }`}
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ParallelBranches() {
  return (
    <div className="relative flex gap-4">
      <div className="flex flex-col items-center" aria-hidden>
        <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border-strong bg-surface text-sm font-semibold tabular-nums text-ink shadow-sm">
          4
        </div>
      </div>

      <div className="flex-1">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-ink-soft">
          Parallel retrieval
        </p>
        <div className="relative grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-brand-400" aria-hidden />
              <p className="text-sm font-semibold text-ink">BM25 search</p>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">
              Lexical match for identifiers, error codes, method names.
            </p>
            <p className="mt-3 font-mono text-[11px] text-ink-soft">
              postgres · ts_rank · plainto_tsquery
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-brand-500" aria-hidden />
              <p className="text-sm font-semibold text-ink">Vector search</p>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">
              Semantic match for paraphrased and conversational queries.
            </p>
            <p className="mt-3 font-mono text-[11px] text-ink-soft">
              pgvector · text-embedding-3-small
            </p>
          </div>
        </div>

        <svg
          className="pointer-events-none mx-auto mt-2 h-6 w-32 text-border-strong"
          viewBox="0 0 128 24"
          fill="none"
          aria-hidden
        >
          <path
            d="M16 0 V8 Q16 16 32 16 H96 Q112 16 112 8 V0"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            transform="rotate(180 64 12)"
          />
          <path
            d="M64 14 L64 22 M60 18 L64 22 L68 18"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

export function LandingHowItWorks() {
  return (
    <section className="mx-auto max-w-4xl px-6 pb-20">
      <div className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-wider text-brand-600">
          Architecture
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          How it works
        </h2>
        <p className="max-w-2xl text-sm text-ink-muted">
          A single tool call (<span className="font-mono">searchKnowledge</span>)
          runs the full retrieval pipeline: hybrid search, RRF fusion, Cohere
          rerank, and confidence classification — returning cited chunks the
          model can answer from.{" "}
          <a
            href="https://github.com/stivenslop2/production-rag-kb#readme"
            target="_blank"
            rel="noreferrer"
            className="text-brand-600 underline hover:text-brand-700"
          >
            Read the full README
          </a>
          .
        </p>
      </div>

      <div className="relative mt-8 rounded-2xl border border-border bg-gradient-to-br from-surface-subtle via-surface to-brand-50/30 p-6 shadow-sm sm:p-8">
        <div
          className="pointer-events-none absolute left-[2.25rem] top-12 bottom-12 w-px bg-gradient-to-b from-border via-border-strong to-border sm:left-[3rem]"
          aria-hidden
        />

        <div className="relative space-y-5">
          <StepCard
            index={1}
            label="Browser"
            description="User types a question in the chat UI."
            meta="app/chat · features/chat/components/*"
            tags={["React 19", "Streamdown"]}
          />
          <StepCard
            index={2}
            label="Streaming chat route"
            description="Server route receives the message and streams tokens back as the model generates."
            meta="app/api/chat/route.ts"
            tags={["Vercel AI SDK v6", "Claude Haiku 4.5"]}
            emphasis="primary"
          />
          <StepCard
            index={3}
            label="searchKnowledge tool"
            description="The model decides when to retrieve. Tool input is Zod-validated, query reformulation happens here."
            meta="features/chat/searchKnowledge.ts"
            tags={["tool calling", "Zod"]}
            emphasis="primary"
          />

          <ParallelBranches />

          <StepCard
            index={5}
            label="RRF fusion → Cohere rerank"
            description="Rankings combine via Reciprocal Rank Fusion (k=60), then a cross-encoder rescore picks the best chunks."
            meta="features/retrieval/searchPipeline.ts"
            tags={["RRF", "Cohere rerank-v3.5"]}
            emphasis="primary"
          />
          <StepCard
            index={6}
            label="Supabase Postgres"
            description="Source of truth: documents, chunks, embeddings, tsvector — all in one database with rag_kb_ prefix."
            meta="rag_kb_documents · rag_kb_chunks"
            tags={["pgvector", "tsvector", "GIN + IVFFlat"]}
          />
        </div>
      </div>
    </section>
  );
}
