import path from "node:path";
import { loadGoldenTasks, runEvalForStrategy } from "@/features/eval/runner";
import type { StrategyMetrics } from "@/features/eval/types";
import type { StrategyName } from "@/features/retrieval/strategies";

const GOLDEN_PATH = path.join("data", "eval", "golden.json");

const STRATEGIES: StrategyName[] = [
  "hybrid+rerank",
  "hybrid",
  "vector",
  "bm25",
];

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
  const tasks = await loadGoldenTasks(GOLDEN_PATH);

  console.log(`Running eval on ${tasks.length} queries × ${STRATEGIES.length} strategies\n`);

  const allMetrics: StrategyMetrics[] = [];
  for (const strategy of STRATEGIES) {
    console.log(`\n${"─".repeat(60)}`);
    console.log(`Strategy: ${strategy}`);
    console.log(`${"─".repeat(60)}`);

    const metrics = await runEvalForStrategy(strategy, tasks, (i, total, task, position) => {
      const status =
        position === null
          ? "MISS"
          : position === 1
            ? " #1 "
            : `#${position.toString().padStart(2, " ")} `;

      console.log(
        `[${(i + 1).toString().padStart(2, " ")}/${total}] ${status} ${task.difficulty.padEnd(14)} ${task.expectedDoc} #${task.expectedIndex}`,
      );
    });
    allMetrics.push(metrics);
  }

  printComparisonTable(allMetrics);
}

main().catch((err) => {
  console.error("Eval failed:", err);
  process.exit(1);
});
