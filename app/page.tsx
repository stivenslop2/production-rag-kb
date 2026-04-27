export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-4xl font-bold text-brand-500">
        Orbiill Knowledge Base
      </h1>
      <p className="text-ink-muted text-lg text-center max-w-xl">
        Production-grade RAG over Orbiill documentation. Hybrid search (BM25 + vector + RRF), Cohere reranking, and retrieval metrics.
      </p>
      <div className="flex gap-4 mt-4">
        <a href="/search" className="px-6 py-3 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600 transition-colors">Search docs</a>
        <a href="/chat" className="px-6 py-3 border border-border rounded-lg font-medium text-ink hover:bg-surface-subtle transition-colors">Chat with KB</a>
      </div>
    </main>
  );
}