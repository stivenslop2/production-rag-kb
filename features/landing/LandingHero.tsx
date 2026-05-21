import Link from "next/link";

const HIGHLIGHTS = [
  "Hybrid retrieval",
  "Cohere rerank",
  "Tool-calling RAG",
  "Eval automation",
];

export function LandingHero() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16 sm:py-24">
      <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 ring-1 ring-brand-200">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
        AI Engineer Portfolio · Next.js 16
      </span>

      <h1 className="mt-6 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
        Production-grade <span className="text-brand-600">RAG</span>
      </h1>

      <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted">
        A retrieval-augmented chatbot over the Orbiill documentation corpus,
        built with the patterns I reach for in production: BM25 + vector search
        fused with RRF, Cohere reranking, and a tool-calling agent that decides
        when to retrieve. Every retrieval strategy is measured against a
        74-query golden dataset.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {HIGHLIGHTS.map((h) => (
          <span
            key={h}
            className="inline-flex items-center rounded-full bg-surface border border-border px-3 py-1 text-xs font-medium text-ink-muted"
          >
            {h}
          </span>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link
          href="/chat"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-card transition-all hover:bg-brand-600 hover:shadow-card-hover"
        >
          Open the chat
          <span aria-hidden>→</span>
        </Link>
        <a
          href="https://github.com/stivenslop2/production-rag-kb"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-brand-200 hover:text-brand-700"
        >
          View source
        </a>
      </div>
    </section>
  );
}
