import { writeFile } from "node:fs/promises";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import pLimit from "p-limit";
import { supabase } from "../shared/lib/supabase";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const MODEL = "claude-sonnet-4-5";
const CONCURRENCY = 5;

interface ChunkRow {
  id: string;
  chunk_index: number;
  content: string;
  documentTitle: string;
}

interface QuerySet {
  literal: string;
  conversational: string;
}

interface GoldenEntry {
  chunkId: string;
  documentTitle: string;
  chunkIndex: number;
  queries: QuerySet | null;
}

async function fetchChunks(): Promise<ChunkRow[]> {
  const { data, error } = await supabase
    .from("rag_kb_chunks")
    .select("id, chunk_index, content, rag_kb_documents(title)")
    .order("chunk_index");

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    chunk_index: row.chunk_index,
    content: row.content,
    documentTitle: row.rag_kb_documents.title,
  }));
}

function buildPromptForChunk(chunk: ChunkRow): string {
  return `You are building a golden dataset to evaluate a RAG retrieval system over the Orbiill billing platform documentation.

The Orbiill documentation is entirely in English. ALL generated queries MUST be in English. The corpus is in English — generating queries in any other language would break the evaluation. This is non-negotiable.

For the chunk below, generate 2 search queries that should retrieve THIS specific chunk as the top result:

1. **literal**: Uses terminology directly from the chunk. Easy mode. Mirrors how docs are written.
2. **conversational**: How a real user would casually ask, without knowing the technical jargon. Hard difficulty. Plain English, casual tone.

CRITICAL RULES:
- ALL queries MUST be in English, regardless of style.
- Each query MUST have THIS specific chunk as the correct answer, not another chunk in the corpus.
- If the chunk is too short, ambiguous, or doesn't contain meaningful content to ask about (e.g., a code fragment without context, a section header alone, a tiny snippet), return null for queries.
- Queries should be 5-15 words. Natural user questions.
- Do NOT generate queries that could match multiple chunks equally well.

Return STRICT JSON in this exact format:

\`\`\`json
{
  "queries": {
    "literal": "...",
    "conversational": "..."
  }
}
\`\`\`

Or if the chunk is not query-worthy:

\`\`\`json
{
  "queries": null
}
\`\`\`

Chunk to process:

Document: ${chunk.documentTitle}
Chunk index: ${chunk.chunk_index}
Content:
${chunk.content}`;
}

async function generateForChunk(chunk: ChunkRow): Promise<GoldenEntry> {
  const prompt = buildPromptForChunk(chunk);

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((c) => c.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error(`No text content for chunk ${chunk.id}`);
  }

  // Extract JSON: prioritize ```json fenced blocks, fallback to balanced braces
  const fencedMatch = textBlock.text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  let jsonString: string | null = null;

  if (fencedMatch) {
    jsonString = fencedMatch[1];
  } else {
    // Fallback: find first balanced JSON object
    const start = textBlock.text.indexOf("{");
    if (start === -1) {
      throw new Error(`No JSON found in response for chunk ${chunk.id}`);
    }
    let depth = 0;
    for (let i = start; i < textBlock.text.length; i++) {
      if (textBlock.text[i] === "{") depth++;
      if (textBlock.text[i] === "}") {
        depth--;
        if (depth === 0) {
          jsonString = textBlock.text.slice(start, i + 1);
          break;
        }
      }
    }
    if (!jsonString) {
      throw new Error(`Unbalanced JSON for chunk ${chunk.id}`);
    }
  }

  const parsed = JSON.parse(jsonString) as { queries: QuerySet | null };

  return {
    chunkId: chunk.id,
    documentTitle: chunk.documentTitle,
    chunkIndex: chunk.chunk_index,
    queries: parsed.queries,
  };
}

async function main() {
  console.log("Fetching chunks from Supabase...");
  const chunks = await fetchChunks();
  console.log(`Fetched ${chunks.length} chunks`);
  console.log(`Generating queries with ${MODEL}, concurrency=${CONCURRENCY}\n`);

  const limit = pLimit(CONCURRENCY);
  let completed = 0;
  const total = chunks.length;

  const tasks = chunks.map((chunk) =>
    limit(async () => {
      try {
        const result = await generateForChunk(chunk);
        completed++;
        const status = result.queries === null ? "SKIP" : "OK  ";
        console.log(
          `[${completed}/${total}] ${status} ${result.documentTitle} #${result.chunkIndex}`,
        );
        return { status: "fulfilled" as const, value: result, chunkId: chunk.id };
      } catch (error) {
        completed++;
        console.log(
          `[${completed}/${total}] FAIL ${chunk.documentTitle} #${chunk.chunk_index}: ${(error as Error).message}`,
        );
        return { status: "rejected" as const, reason: error, chunkId: chunk.id };
      }
    }),
  );

  const results = await Promise.all(tasks);

  const successes = results.filter((r) => r.status === "fulfilled");
  const failures = results.filter((r) => r.status === "rejected");
  const goldenEntries = successes.map((r) => r.value);

  const withQueries = goldenEntries.filter((g) => g.queries !== null);
  const skipped = goldenEntries.filter((g) => g.queries === null);

  console.log(`\nSummary:`);
  console.log(`  Successful: ${successes.length}/${total}`);
  console.log(`  Failed: ${failures.length}/${total}`);
  console.log(`  Generated queries for: ${withQueries.length} chunks`);
  console.log(`  Skipped (chunk not query-worthy): ${skipped.length} chunks`);
  console.log(`  Total queries: ${withQueries.length * 2}`);

  if (skipped.length > 0) {
    console.log(`\n  Skipped chunks:`);
    skipped.forEach((s) =>
      console.log(`    - ${s.documentTitle} #${s.chunkIndex}`),
    );
  }

  if (failures.length > 0) {
    console.log(`\n  Failed chunks:`);
    failures.forEach((f) => {
      const chunk = chunks.find((c) => c.id === f.chunkId);
      console.log(
        `    - ${chunk?.documentTitle} #${chunk?.chunk_index}: ${(f.reason as Error).message}`,
      );
    });
  }

  const outputPath = path.join("data", "eval", "golden.json");
  await writeFile(outputPath, JSON.stringify(goldenEntries, null, 2), "utf-8");
  console.log(`\nSaved to ${outputPath}`);
}

main().catch((err) => {
  console.error("Generation failed:", err);
  process.exit(1);
});