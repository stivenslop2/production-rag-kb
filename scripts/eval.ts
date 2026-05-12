import { readFile } from "node:fs/promises";
import path from "node:path";
import { searchPipeline } from "../features/retrieval/searchPipeline";

const GOLDEN_PATH = path.join("data", "eval", "golden.json");
const EVAL_TOP_N = 20;
const PRECISION_K = 5;

interface GoldenEntry {
  chunkId: string;
  documentTitle: string;
  chunkIndex: number;
  queries: {
    literal: string;
    conversational: string;
  } | null;
}

interface QueryResult {
  query: string;
  difficulty: "literal" | "conversational";
  expectedChunkId: string;
  expectedDoc: string;
  position: number | null; // 1-indexed; null = not found in top N
}

async function main() {
  const raw = await readFile(GOLDEN_PATH, "utf-8");
  const golden = JSON.parse(raw) as GoldenEntry[];

  // Flatten golden entries into a list of (query, expected) pairs
  const tasks: Array<{
    query: string;
    difficulty: "literal" | "conversational";
    expectedChunkId: string;
    expectedDoc: string;
    expectedIndex: number;
  }> = [];

  for (const entry of golden) {
    if (!entry.queries) continue;
    tasks.push({
      query: entry.queries.literal,
      difficulty: "literal",
      expectedChunkId: entry.chunkId,
      expectedDoc: entry.documentTitle,
      expectedIndex: entry.chunkIndex,
    });
    tasks.push({
      query: entry.queries.conversational,
      difficulty: "conversational",
      expectedChunkId: entry.chunkId,
      expectedDoc: entry.documentTitle,
      expectedIndex: entry.chunkIndex,
    });
  }

  console.log(`Running eval on ${tasks.length} queries...\n`);

  const results: QueryResult[] = [];

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const pipelineResults = await searchPipeline(task.query, {
      topN: EVAL_TOP_N,
    });

    const position =
      pipelineResults.findIndex((r) => r.id === task.expectedChunkId) + 1 ||
      null;

    const result: QueryResult = {
      query: task.query,
      difficulty: task.difficulty,
      expectedChunkId: task.expectedChunkId,
      expectedDoc: task.expectedDoc,
      position,
    };
    results.push(result);

    const status =
      position === null
        ? "MISS"
        : position === 1
          ? " #1 "
          : `#${position.toString().padStart(2, " ")} `;

    console.log(
      `[${(i + 1).toString().padStart(2, " ")}/${tasks.length}] ${status} ${task.difficulty.padEnd(14)} ${task.expectedDoc} #${task.expectedIndex}`,
    );
    console.log(`         "${task.query}"`);
  }

  // Calculate metrics
  const totalQueries = results.length;

  // Precision@K: of the top K results, what fraction are relevant?
  // In our case, each query has exactly 1 correct chunk, so precision@k is
  // either 1/k (if found in top k) or 0 (if not found).
  const precisionAtK =
    results.reduce((sum, r) => {
      if (r.position !== null && r.position <= PRECISION_K) {
        return sum + 1 / PRECISION_K;
      }
      return sum;
    }, 0) / totalQueries;

  // MRR: average of 1/position across all queries
  const mrr =
    results.reduce((sum, r) => {
      if (r.position === null) return sum;
      return sum + 1 / r.position;
    }, 0) / totalQueries;

  // NDCG@K: DCG normalized by ideal DCG
  // For single-correct-chunk queries: DCG = 1/log2(position+1) if found
  // Ideal DCG = 1/log2(2) = 1 (chunk at position 1)
  const ndcg =
    results.reduce((sum, r) => {
      if (r.position === null || r.position > PRECISION_K) return sum;
      return sum + 1 / Math.log2(r.position + 1);
    }, 0) / totalQueries;

  // Breakdowns
  const literalResults = results.filter((r) => r.difficulty === "literal");
  const conversationalResults = results.filter(
    (r) => r.difficulty === "conversational",
  );

  const hitRate = (rs: QueryResult[]) =>
    rs.filter((r) => r.position !== null).length / rs.length;
  const top1Rate = (rs: QueryResult[]) =>
    rs.filter((r) => r.position === 1).length / rs.length;
  const top5Rate = (rs: QueryResult[]) =>
    rs.filter((r) => r.position !== null && r.position <= 5).length / rs.length;

  console.log(`\n${"=".repeat(60)}`);
  console.log(`EVAL RESULTS`);
  console.log(`${"=".repeat(60)}\n`);

  console.log(`Total queries: ${totalQueries}`);
  console.log(`Top N retrieved per query: ${EVAL_TOP_N}\n`);

  console.log(`Metrics (overall):`);
  console.log(`  Precision@${PRECISION_K}: ${precisionAtK.toFixed(4)}`);
  console.log(`  MRR:          ${mrr.toFixed(4)}`);
  console.log(`  NDCG@${PRECISION_K}:      ${ndcg.toFixed(4)}\n`);

  console.log(`Hit rates:`);
  console.log(`  Found in top 1:  ${(top1Rate(results) * 100).toFixed(1)}%`);
  console.log(`  Found in top 5:  ${(top5Rate(results) * 100).toFixed(1)}%`);
  console.log(
    `  Found in top ${EVAL_TOP_N}: ${(hitRate(results) * 100).toFixed(1)}%\n`,
  );

  console.log(`By difficulty — Top 1 rate:`);
  console.log(`  literal:        ${(top1Rate(literalResults) * 100).toFixed(1)}%`);
  console.log(
    `  conversational: ${(top1Rate(conversationalResults) * 100).toFixed(1)}%\n`,
  );

  console.log(`By difficulty — Top 5 rate:`);
  console.log(`  literal:        ${(top5Rate(literalResults) * 100).toFixed(1)}%`);
  console.log(
    `  conversational: ${(top5Rate(conversationalResults) * 100).toFixed(1)}%\n`,
  );
}

main().catch((err) => {
  console.error("Eval failed:", err);
  process.exit(1);
});