import { readFile } from "node:fs/promises";
import path from "node:path";
import { runStrategy, StrategyName } from "../features/retrieval/strategies";

const GOLDEN_PATH = path.join("data", "eval", "golden.json");
const EVAL_TOP_N = 20;
const PRECISION_K = 5;

const STRATEGIES: StrategyName[] = [
  "hybrid+rerank",
  "hybrid",
  "vector",
  "bm25",
];

interface GoldenEntry {
  chunkId: string;
  documentTitle: string;
  chunkIndex: number;
  queries: {
    literal: string;
    conversational: string;
  } | null;
}

interface Task {
  query: string;
  difficulty: "literal" | "conversational";
  expectedChunkId: string;
  expectedDoc: string;
  expectedIndex: number;
}

interface QueryResult {
  difficulty: "literal" | "conversational";
  position: number | null;
}

interface StrategyMetrics {
  strategy: StrategyName;
  precisionAtK: number;
  mrr: number;
  ndcg: number;
  top1Rate: number;
  top5Rate: number;
  hitRate: number;
  top1Literal: number;
  top1Conversational: number;
  top5Literal: number;
  top5Conversational: number;
}

function calculateMetrics(
  strategy: StrategyName,
  results: QueryResult[],
): StrategyMetrics {
  const total = results.length;

  const precisionAtK =
    results.reduce((sum, r) => {
      if (r.position !== null && r.position <= PRECISION_K) {
        return sum + 1 / PRECISION_K;
      }
      return sum;
    }, 0) / total;

  const mrr =
    results.reduce((sum, r) => {
      if (r.position === null) return sum;
      return sum + 1 / r.position;
    }, 0) / total;

  const ndcg =
    results.reduce((sum, r) => {
      if (r.position === null || r.position > PRECISION_K) return sum;
      return sum + 1 / Math.log2(r.position + 1);
    }, 0) / total;

  const rate = (filter: (r: QueryResult) => boolean) =>
    results.filter(filter).length / total;

  const literal = results.filter((r) => r.difficulty === "literal");
  const conversational = results.filter((r) => r.difficulty === "conversational");

  const rateIn = (rs: QueryResult[], max: number) =>
    rs.filter((r) => r.position !== null && r.position <= max).length / rs.length;

  return {
    strategy,
    precisionAtK,
    mrr,
    ndcg,
    top1Rate: rate((r) => r.position === 1),
    top5Rate: rate((r) => r.position !== null && r.position <= 5),
    hitRate: rate((r) => r.position !== null),
    top1Literal: rateIn(literal, 1),
    top1Conversational: rateIn(conversational, 1),
    top5Literal: rateIn(literal, 5),
    top5Conversational: rateIn(conversational, 5),
  };
}

async function runEvalForStrategy(
  strategy: StrategyName,
  tasks: Task[],
): Promise<StrategyMetrics> {
  console.log(`\n${"─".repeat(60)}`);
  console.log(`Strategy: ${strategy}`);
  console.log(`${"─".repeat(60)}`);

  const results: QueryResult[] = [];

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const ids = await runStrategy(strategy, task.query, EVAL_TOP_N);

    const position = ids.indexOf(task.expectedChunkId) + 1 || null;

    results.push({ difficulty: task.difficulty, position });

    const status =
      position === null
        ? "MISS"
        : position === 1
          ? " #1 "
          : `#${position.toString().padStart(2, " ")} `;

    console.log(
      `[${(i + 1).toString().padStart(2, " ")}/${tasks.length}] ${status} ${task.difficulty.padEnd(14)} ${task.expectedDoc} #${task.expectedIndex}`,
    );
  }

  return calculateMetrics(strategy, results);
}

function printComparisonTable(metrics: StrategyMetrics[]) {
  console.log(`\n${"=".repeat(80)}`);
  console.log(`COMPARISON TABLE`);
  console.log(`${"=".repeat(80)}\n`);

  const pad = (s: string, n: number) => s.padEnd(n);
  const padNum = (n: number, w: number) => n.toFixed(4).padStart(w);
  const padPct = (n: number, w: number) =>
    `${(n * 100).toFixed(1)}%`.padStart(w);

  console.log(
    `${pad("Strategy", 16)}${pad("Prec@5", 10)}${pad("MRR", 10)}${pad("NDCG@5", 10)}${pad("Top1", 8)}${pad("Top5", 8)}${pad("Top20", 8)}`,
  );
  console.log("─".repeat(80));

  for (const m of metrics) {
    console.log(
      `${pad(m.strategy, 16)}${padNum(m.precisionAtK, 8)}  ${padNum(m.mrr, 8)}  ${padNum(m.ndcg, 8)}  ${padPct(m.top1Rate, 6)}  ${padPct(m.top5Rate, 6)}  ${padPct(m.hitRate, 6)}`,
    );
  }

  console.log(`\n${"─".repeat(80)}`);
  console.log(`By difficulty — Top 5 rate`);
  console.log("─".repeat(80));
  console.log(
    `${pad("Strategy", 16)}${pad("Literal", 12)}${pad("Conversational", 16)}`,
  );
  console.log("─".repeat(80));
  for (const m of metrics) {
    console.log(
      `${pad(m.strategy, 16)}${padPct(m.top5Literal, 10)}  ${padPct(m.top5Conversational, 14)}`,
    );
  }
  console.log();
}

async function main() {
  const raw = await readFile(GOLDEN_PATH, "utf-8");
  const golden = JSON.parse(raw) as GoldenEntry[];

  const tasks: Task[] = [];
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

  console.log(`Running eval on ${tasks.length} queries × ${STRATEGIES.length} strategies\n`);

  const allMetrics: StrategyMetrics[] = [];
  for (const strategy of STRATEGIES) {
    const metrics = await runEvalForStrategy(strategy, tasks);
    allMetrics.push(metrics);
  }

  printComparisonTable(allMetrics);
}

main().catch((err) => {
  console.error("Eval failed:", err);
  process.exit(1);
});