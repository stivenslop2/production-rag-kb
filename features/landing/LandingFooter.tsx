export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-surface-subtle">
      <div className="mx-auto max-w-4xl px-6 py-10 space-y-3 text-sm">
        <p className="font-medium text-ink">
          Built by Julian Lopez &mdash; AI Engineer
        </p>
        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-ink-muted">
          <a
            href="https://stivenslop.up.railway.app"
            className="hover:text-brand-600 transition-colors"
          >
            Portfolio
          </a>
          <span aria-hidden className="text-ink-soft">
            &middot;
          </span>
          <a
            href="https://www.linkedin.com/in/jstivenslopez/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-brand-600 transition-colors"
          >
            LinkedIn
          </a>
          <span aria-hidden className="text-ink-soft">
            &middot;
          </span>
          <a
            href="https://github.com/stivenslop2"
            target="_blank"
            rel="noreferrer"
            className="hover:text-brand-600 transition-colors"
          >
            GitHub
          </a>
          <span aria-hidden className="text-ink-soft">
            &middot;
          </span>
          <a
            href="mailto:stivenslop@hotmail.com"
            className="hover:text-brand-600 transition-colors"
          >
            Email
          </a>
        </nav>
      </div>
    </footer>
  );
}
