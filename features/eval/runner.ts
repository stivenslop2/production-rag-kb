import { readFile } from "node:fs/promises";
import { runStrategy, type StrategyName } from "@/features/retrieval/strategies";
import { calculateMetrics } from "./metrics";
import type { GoldenEntry, QueryResult, StrategyMetrics, Task } from "./types";

export const EVAL_TOP_N = 20;

export async function loadGoldenTasks(goldenPath: string): Promise<Task[]> {
  const raw = await readFile(goldenPath, "utf-8");
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
  return tasks;
}

export async function runEvalForStrategy(
  strategy: StrategyName,
  tasks: Task[],
  onProgress?: (taskIndex: number, total: number, task: Task, position: number | null) => void,
): Promise<StrategyMetrics> {
  const results: QueryResult[] = [];

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const ids = await runStrategy(strategy, task.query, EVAL_TOP_N);
    const position = ids.indexOf(task.expectedChunkId) + 1 || null;
    results.push({ difficulty: task.difficulty, position });
    onProgress?.(i, tasks.length, task, position);
  }

  return calculateMetrics(strategy, results);
}
