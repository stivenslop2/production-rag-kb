<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version (16.2.4) has breaking changes — APIs, conventions, and file structure may differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project overview

Production RAG Knowledge Base — a portfolio project demonstrating production-grade retrieval-augmented generation over Orbiill's documentation corpus:

- Hybrid search: BM25 (PostgreSQL tsvector) + vector (pgvector) with RRF fusion
- Reranking with Cohere Rerank API
- Strategic chunking: recursive text splitting with overlap
- Retrieval metrics: precision@k, MRR, NDCG with a 50-question golden dataset
- Streaming chat with Vercel AI SDK v6 + tool-calling RAG pipeline
- Eval automation runnable via `npm run eval`

All code, UI strings, and comments are in English.

## Directory layout

\`\`\`
app/                        Routing + thin page wrappers only
  api/
    chat/route.ts           POST — streaming chat with RAG context
  page.tsx                  Chat interface (root)
  search/page.tsx           [planned] Search explorer with retrieval traces — not yet implemented
features/
  ingestion/                Document chunking, embedding, and DB storage
  retrieval/                Vector search, BM25, RRF fusion, reranking
  chat/                     Chat UI components + searchKnowledge tool
  eval/                     Metrics (precision@k, MRR, NDCG) + golden-set runner
  landing/                  [placeholder] Future landing page components
shared/
  lib/                      Library wrappers (supabase, embeddings, cohere)
  types/                    Cross-feature types (search, document)
data/
  docs/                     Raw markdown — Orbiill documentation corpus
  eval/                     Golden dataset (golden.json)
scripts/
  ingest.ts                 CLI ingestion (npm run ingest)
  eval.ts                   CLI eval runner (npm run eval) — thin wrapper around features/eval
  generate-golden-dataset.ts  CLI to synthesize the golden set
  verify-*.ts               Manual CLI smoke checks for each retrieval layer (not an automated test suite)
\`\`\`

- Routes under `app/` import from `features/` or `shared/`. No feature code in `app/`.
- `features/<n>/components/` holds feature-owned React components.
- Data access through `features/<domain>/store.ts`.
- Mutations through Server Actions in `features/<domain>/actions.ts`.

## Conventions

- **Server Components by default.** Add `"use client"` only where interactivity forces it.
- **Data access** goes through `features/<domain>/store.ts`. Do not call Supabase directly from route handlers.
- **Route Handlers** live at `app/api/**/route.ts` for streaming and JSON endpoints.
- **Types** live in `features/<n>/types.ts`. Cross-feature types in `shared/types/`. Prefer `interface` for object shapes.
- **Styling** uses Tailwind v4 tokens declared in `app/globals.css` (`brand-*`, `surface-*`, `ink-*`, `border`). No hardcoded hex.
- **No incidental comments.** Only add a comment when the *why* is non-obvious.
- **File names:** PascalCase for React components, camelCase for everything else.

## AI features

*(To be documented as features are implemented)*

- **Ingestion pipeline** — `npm run ingest` reads `data/docs/*.md`, applies recursive chunking, generates embeddings via `text-embedding-3-small`, stores chunks with text + vector in Supabase.
- **Hybrid search** — vector search (cosine similarity) + BM25 (tsvector) combined via RRF.
- **Reranking** — Cohere Rerank API reorders top candidates for final retrieval.
- **Eval** — `npm run eval` runs 50 golden-dataset queries, computes precision@k, MRR, NDCG.

## Secrets

`OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `COHERE_API_KEY`, `ANTHROPIC_API_KEY` in `.env.local`. `.env.example` documents them.

## Before writing code

- **Next.js questions:** read `node_modules/next/dist/docs/` first.
- **Library questions** (`ai`, `@ai-sdk/openai`, `cohere-ai`, `@supabase/supabase-js`): use Context7 MCP or official docs.
- **Scope:** keep changes narrow and aligned with the project's portfolio goals.