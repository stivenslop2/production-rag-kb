export function LandingHeader() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
        <p className="text-sm font-semibold tracking-tight text-ink">
          Production RAG · Orbiill Docs
        </p>
        <a
          href="https://stivenslop.up.railway.app"
          className="text-sm text-ink-muted hover:text-brand-600 transition-colors"
        >
          <span aria-hidden>&larr;</span> Portfolio
        </a>
      </div>
    </header>
  );
}
