interface Technique {
  name: string;
  description: string;
  location: string;
}

const TECHNIQUES: Technique[] = [
  {
    name: "Hybrid retrieval (BM25 + vector)",
    description:
      "Parallel keyword (Postgres tsvector) and semantic (pgvector) search fused with Reciprocal Rank Fusion (k = 60). Keeps lexical precision and semantic recall in the same result set.",
    location: "features/retrieval/hybridSearch.ts",
  },
  {
    name: "Reranking",
    description:
      "Top-20 hybrid candidates rescored by the Cohere Rerank API before final selection. Trades a small latency hit for measurable jumps in precision@5 and NDCG.",
    location: "features/retrieval/rerank.ts · features/retrieval/searchPipeline.ts",
  },
  {
    name: "Tool-calling RAG agent",
    description:
      "Claude Haiku 4.5 decides when to call searchKnowledge, reformulates queries for the index, and classifies confidence (high / medium / low) per turn. stepCountIs(5) caps the loop.",
    location: "app/api/chat/route.ts · features/chat/searchKnowledge.ts",
  },
  {
    name: "Eval automation",
    description:
      "50-question golden set with literal and conversational query variants. Each retrieval strategy (bm25, vector, hybrid, hybrid+rerank) is scored on precision@5, MRR, NDCG, and difficulty-stratified hit rates.",
    location: "features/eval/runner.ts · features/eval/metrics.ts · scripts/eval.ts",
  },
  {
    name: "Strategic chunking",
    description:
      "Recursive markdown splitting (~1000 char target, 200 char overlap, heading-aware) with frontmatter parsing via gray-matter.",
    location: "features/ingestion/chunker.ts",
  },
];

export function LandingSkills() {
  return (
    <section className="mx-auto max-w-4xl px-6 pb-16">
      <h2 className="text-2xl font-semibold tracking-tight text-ink">
        What this demonstrates
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
        Each row maps to a specific RAG pattern and the file where it lives.
      </p>

      <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-surface shadow-card">
        <table className="w-full text-sm text-left">
          <thead className="bg-surface-subtle text-ink-muted text-xs uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 font-medium">Technique</th>
              <th className="px-4 py-3 font-medium">What it does here</th>
              <th className="px-4 py-3 font-medium">Where to look</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {TECHNIQUES.map((t) => (
              <tr key={t.name} className="align-top">
                <td className="px-4 py-4 font-medium text-ink whitespace-nowrap">
                  {t.name}
                </td>
                <td className="px-4 py-4 text-ink-muted">{t.description}</td>
                <td className="px-4 py-4 text-ink-soft font-mono text-xs whitespace-pre-line">
                  {t.location.split(" · ").join("\n")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
