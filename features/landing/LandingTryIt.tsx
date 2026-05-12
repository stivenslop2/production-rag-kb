import Link from "next/link";

const SUGGESTIONS = [
  "What error code do I get when I'm rate limited?",
  "How do I verify a webhook signature?",
  "Which SDK languages are supported?",
];

export function LandingTryIt() {
  return (
    <section className="mx-auto max-w-4xl px-6 pb-16">
      <h2 className="text-2xl font-semibold tracking-tight text-ink">Try it</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
        Ask the agent a question about Orbiill. It searches the docs, reranks,
        and answers with cited chunks — or admits when the knowledge base
        doesn&apos;t have the answer.
      </p>

      <div className="mt-6 rounded-xl border border-border bg-surface p-5 shadow-card">
        <p className="text-xs font-medium uppercase tracking-wider text-ink-soft">
          Sample questions
        </p>
        <ul className="mt-3 space-y-2">
          {SUGGESTIONS.map((s) => (
            <li
              key={s}
              className="rounded-lg bg-surface-subtle px-3 py-2 text-sm text-ink"
            >
              {s}
            </li>
          ))}
        </ul>
        <div className="mt-5">
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-card transition-all hover:bg-brand-600 hover:shadow-card-hover"
          >
            Try the chat
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
