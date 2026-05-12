---
title: "refactor: Portfolio polish pass for production-rag-kb"
type: refactor
status: active
date: 2026-05-11
---

# refactor: Portfolio polish pass for production-rag-kb

## Overview

End-to-end polish pass before showcasing this project. The architecture is sound (feature-sliced, Next.js 16 + AI SDK, Supabase pgvector + BM25, RRF + Cohere rerank). This plan fixes naming typos, enforces the English-only convention, populates the documented-but-empty `shared/types/` slot, promotes the eval logic from a script into a real feature module, and brings `AGENTS.md` back in sync with what actually exists.

No behavioral changes. No new product features. Every unit is a mechanical refactor or a documentation correction.

---

## Problem Frame

The project works but has small inconsistencies that hurt credibility in a portfolio context:

- Two filename typos (`earchKnowledge.ts`, `test-chucker.ts`).
- Three files contain leftover Spanish comments despite the documented English-only convention.
- `shared/types/` exists per `AGENTS.md` but is empty; cross-feature types live inside `features/retrieval/types.ts`.
- `features/eval/` exists as an empty folder; the actual eval logic is buried inside `scripts/eval.ts`.
- `scripts/test-*.ts` are CLI verification scripts, not unit tests — the name implies otherwise.
- `AGENTS.md` advertises a `search/page.tsx` "search explorer with retrieval traces" that does not exist.
- A `ToolPart` type is inlined in `ChatMessage.tsx` (lines ~10–26) instead of living in a feature types file.

---

## Requirements Trace

- R1. All filenames are spelled correctly and imports are updated.
- R2. No Spanish comments or identifiers remain in source files.
- R3. Truly cross-feature types live in `shared/types/`; truly feature-local types stay in their feature.
- R4. `features/eval/` contains reusable evaluation logic (metrics, runner); `scripts/eval.ts` is a thin CLI wrapper.
- R5. `features/landing/` is preserved as a placeholder for a future landing page (per user direction).
- R6. CLI verification scripts are named `verify-*.ts` to signal intent.
- R7. `AGENTS.md` reflects reality: `search/page.tsx` is marked as planned, not as if it exists.
- R8. `ToolPart` is extracted out of the component file.
- R9. `pnpm build` and `pnpm lint` pass after every unit.

---

## Scope Boundaries

- No changes to retrieval algorithms, chunking strategy, prompts, or schemas.
- No migration to Vitest. Verification scripts stay as runnable CLI checks.
- No implementation of `search/page.tsx` — only the doc is updated to reflect its absence.
- No changes to Supabase schema, embeddings model, or rerank model.
- No `features/landing/` content — folder stays as scaffold with a `.gitkeep` and a one-line `README.md` documenting intent.

---

## Context & Research

### Relevant Code and Patterns

- `features/retrieval/types.ts` — current home of `SearchResult`, `HybridSearchResult`, `RerankedResult`. Imported across retrieval pipeline.
- `features/ingestion/types.ts` — current home of `DocumentMetadata`, `ParsedDocument`, `ChunkWithEmbedding`. `DocumentMetadata` surfaces in retrieval results.
- `features/retrieval/searchPipeline.ts` — Spanish comments at the `Paso 1 / Paso 2 / Mapear índices` markers.
- `features/chat/components/ChatMessage.tsx` — Spanish comment near line 46; inline `ToolPart` interface lines ~10–26.
- `scripts/test-rerank.ts` — Spanish `Paso 1 / Paso 2` comments.
- `scripts/eval.ts` (208 lines), `scripts/generate-golden-dataset.ts` (215 lines) — contain metric helpers (precision@k, MRR, NDCG) that are reusable and belong in `features/eval/`.
- `AGENTS.md` — single source of truth for conventions; needs the `search/page.tsx` line corrected.

### Conventions to Follow

- PascalCase for components, camelCase for utilities (per `AGENTS.md`).
- English-only for code, UI, and comments.
- Types co-located in `features/<n>/types.ts` unless cross-feature, in which case `shared/types/`.
- Data access through `features/<domain>/store.ts`.

---

## Key Technical Decisions

- **Promote types selectively, not wholesale.** Move only the types that genuinely cross feature boundaries (`SearchResult`, `HybridSearchResult`, `RerankedResult`, `DocumentMetadata`). Keep `ParsedDocument`, `ChunkWithEmbedding` inside `features/ingestion/types.ts` — they are ingestion-internal. Rationale: respect both the documented `shared/types/` convention AND co-location for truly local types.
- **Eval feature gets metrics + runner; script stays as CLI entry.** `features/eval/metrics.ts` (pure functions: precision@k, MRR, NDCG), `features/eval/runner.ts` (orchestration: load golden set, run pipeline, compute scores). `scripts/eval.ts` shrinks to argument parsing + calling the runner. Rationale: separates pure logic (testable, reusable) from CLI concerns.
- **`verify-*.ts` over `test-*.ts`.** Honest about intent: these are smoke checks, not an automated suite. Rationale: a reviewer of the portfolio knows immediately what they are looking at.
- **Mark `search/page.tsx` as planned, do not implement.** Out of scope for this polish pass; user can re-evaluate building it later.

---

## Open Questions

### Resolved During Planning

- shared/types/ scope → promote only cross-feature types (user confirmed).
- features/eval/ → migrate reusable logic from `scripts/eval.ts` (user confirmed).
- features/landing/ → keep as scaffold for future landing page (user confirmed).
- scripts naming → `verify-*.ts` (user confirmed).
- search/page.tsx → mark as planned in AGENTS.md (user confirmed).

### Deferred to Implementation

- Exact split between `metrics.ts` and `runner.ts` may shift once the eval script is actually read line-by-line.

---

## Implementation Units

- [x] **U1. Rename typo'd files and update imports**

**Goal:** Fix `earchKnowledge.ts` and `test-chucker.ts`.

**Requirements:** R1, R9

**Dependencies:** None

**Files:**
- Rename: `features/chat/earchKnowledge.ts` → `features/chat/searchKnowledge.ts`
- Rename: `scripts/test-chucker.ts` → `scripts/test-chunker.ts` *(will be renamed again in U6 to `verify-chunker.ts`, but rename in two steps to keep diffs reviewable)*
- Modify: any file importing from the old paths (likely `app/api/chat/route.ts`)

**Approach:**
- Search for string imports of `earchKnowledge` and `test-chucker` repo-wide; update each.
- Run `pnpm build` to surface any missed import.

**Verification:** `pnpm build` succeeds; no string matches for `earchKnowledge` or `test-chucker` remain.

---

- [x] **U2. Translate remaining Spanish comments to English**

**Goal:** Remove Spanish from `searchPipeline.ts`, `test-rerank.ts`, and `ChatMessage.tsx`.

**Requirements:** R2

**Dependencies:** None

**Files:**
- Modify: `features/retrieval/searchPipeline.ts`
- Modify: `scripts/test-rerank.ts` (note: file will be renamed in U6)
- Modify: `features/chat/components/ChatMessage.tsx`

**Approach:**
- Replace "Paso 1 / Paso 2 / Paso 3" with "Step 1 / Step 2 / Step 3" — or better, delete them entirely. The code is already self-explanatory; if removing them does not reduce clarity, remove them per the project's no-incidental-comments convention.
- Translate "Mapear índices…vuelta" to a single concise English comment, or delete if the code is clear.
- Translate "Recolectar todos los chunks únicos…" to English, or delete if obvious.

**Verification:** No non-English text remains in source files. Manual grep for common Spanish words (`Paso`, `índices`, `Recolectar`, `vuelta`, `únicos`) returns zero matches.

---

- [x] **U3. Create `shared/types/` and promote cross-feature types**

**Goal:** Move truly shared types out of features and into `shared/types/`.

**Requirements:** R3, R9

**Dependencies:** None

**Files:**
- Create: `shared/types/search.ts` — exports `SearchResult`, `HybridSearchResult`, `RerankedResult`
- Create: `shared/types/document.ts` — exports `DocumentMetadata`
- Create: `shared/types/index.ts` — barrel re-exporting both
- Modify: `features/retrieval/types.ts` — re-export from `shared/types/search.ts` during transition, or delete and let consumers import from `shared/types/`
- Modify: `features/ingestion/types.ts` — keep `ParsedDocument` and `ChunkWithEmbedding`; remove `DocumentMetadata` (import from shared)
- Modify: every consumer importing the moved types (likely `features/retrieval/*.ts`, `features/chat/searchKnowledge.ts`, `scripts/eval.ts`)

**Approach:**
- One PR-style change: move the types, update imports in one pass, do not leave re-export shims unless the file count makes a single sweep risky.
- Keep type definitions byte-identical to avoid behavioral drift.

**Verification:** `pnpm build` passes; `tsc --noEmit` clean; no duplicate type declarations remain.

---

- [x] **U4. Extract `ToolPart` from `ChatMessage.tsx`**

**Goal:** Move the inline `ToolPart` interface to `features/chat/types.ts`.

**Requirements:** R8, R9

**Dependencies:** None

**Files:**
- Create: `features/chat/types.ts` — exports `ToolPart`
- Modify: `features/chat/components/ChatMessage.tsx` — import `ToolPart` instead of declaring it inline

**Approach:**
- Lift the interface verbatim from `ChatMessage.tsx` lines ~10–26.
- If any other chat component references it, switch them to the new import.

**Verification:** `pnpm build` passes; `ChatMessage.tsx` no longer contains the `ToolPart` interface declaration.

---

- [x] **U5. Migrate eval logic into `features/eval/`**

**Goal:** Promote reusable evaluation metrics and orchestration from `scripts/eval.ts` into `features/eval/`. Keep the CLI script thin.

**Requirements:** R4, R9

**Dependencies:** U3 (uses `SearchResult` from shared types)

**Files:**
- Create: `features/eval/metrics.ts` — pure functions: `precisionAtK`, `meanReciprocalRank`, `ndcg`
- Create: `features/eval/runner.ts` — orchestration: load golden set, run search pipeline per query, compute aggregate scores
- Create: `features/eval/types.ts` — `GoldenQuery`, `EvalResult`, `EvalScore` (or promote to `shared/types/` if other features need them — they currently do not)
- Modify: `scripts/eval.ts` — becomes a thin CLI: parse args (golden path, output path), call `runner`, print results
- Modify: `scripts/generate-golden-dataset.ts` — leave as-is unless it shares helpers with the runner; reassess during implementation

**Approach:**
- Read `scripts/eval.ts` end-to-end before splitting. The split between `metrics.ts` and `runner.ts` is conceptual: math functions vs. orchestration.
- Do not change behavior. Output numbers must match pre-refactor output for the same golden set.

**Verification:**
- Run eval before and after refactor on the same golden set — numeric outputs identical.
- `pnpm build` passes.

---

- [x] **U6. Rename `scripts/test-*.ts` → `scripts/verify-*.ts`**

**Goal:** Honest naming for what these scripts actually are.

**Requirements:** R6, R9

**Dependencies:** U1, U2 (lets earlier units operate on stable filenames first)

**Files:**
- Rename: `scripts/test-chunker.ts` → `scripts/verify-chunker.ts`
- Rename: `scripts/test-vector-search.ts` → `scripts/verify-vector-search.ts`
- Rename: `scripts/test-bm25-search.ts` → `scripts/verify-bm25-search.ts`
- Rename: `scripts/test-hybrid-search.ts` → `scripts/verify-hybrid-search.ts`
- Rename: `scripts/test-rerank.ts` → `scripts/verify-rerank.ts`
- Rename: `scripts/test-search-pipeline.ts` → `scripts/verify-search-pipeline.ts`
- Modify: `package.json` scripts entries if they reference these files
- Modify: `README.md` / `AGENTS.md` if they reference these files

**Approach:** Pure renames + reference updates.

**Verification:** Each renamed script still runs and exits 0 (`tsx scripts/verify-<name>.ts`).

---

- [x] **U7. Sync `AGENTS.md` and `README.md` with reality**

**Goal:** Fix the `search/page.tsx` claim, document the landing folder, document the eval feature, document the `verify-*` scripts, document the new `shared/types/` layout.

**Requirements:** R5, R7

**Dependencies:** U1–U6

**Files:**
- Modify: `AGENTS.md`
- Modify: `README.md` (if it duplicates structural claims)
- Create: `features/landing/.gitkeep`
- Create: `features/landing/README.md` — one line: "Placeholder for future landing page."

**Approach:**
- In `AGENTS.md`, change the `search/page.tsx` bullet to: `search/page.tsx` *(planned — retrieval-trace explorer, not yet implemented)*.
- Add a note under the eval section pointing to `features/eval/` for the metric/runner logic.
- Confirm the types section accurately describes the new `shared/types/` contents.

**Verification:** Documentation references match the filesystem. No bullet in `AGENTS.md` describes a file that does not exist.

---

## System-Wide Impact

- **Interaction graph:** Import paths change in retrieval, chat, and scripts. The set of files touched is contained but spans features.
- **Error propagation:** Unchanged. No runtime behavior is modified.
- **State lifecycle risks:** None — this is a refactor.
- **API surface parity:** `pnpm` script names may change if `package.json` references `test-*.ts` files; verify before/after.
- **Integration coverage:** Run all `verify-*.ts` scripts and one end-to-end eval after U5 to confirm parity.
- **Unchanged invariants:** Retrieval ranking, chunk sizes, embeddings model, rerank model, prompt, streaming behavior — none of these are touched.

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Missed import after rename causes runtime failure | Run `pnpm build` and `tsc --noEmit` after every unit; grep for old names before declaring done. |
| Eval refactor (U5) accidentally changes numeric output | Capture eval output before refactor; compare to post-refactor output on same golden set. |
| Type duplication if shim left behind in `features/retrieval/types.ts` | Do the move in one sweep; do not leave compatibility re-exports. |
| `package.json` script entries reference old `test-*` filenames | Update `package.json` in U6 explicitly. |

---

## Sequencing

U1, U2, U3, U4 are independent and can land in any order (or as a single batch).
U5 depends on U3 (shared types).
U6 should follow U1, U2 to avoid renaming churn.
U7 lands last so it documents the final state.

Suggested order: **U1 → U2 → U3 → U4 → U5 → U6 → U7**.

---

## Sources & References

- Brainstorm dialog: this session (no `docs/brainstorms/` doc was written — Lightweight refactor)
- `AGENTS.md` (project conventions)
- Repo structure as of 2026-05-11
