import type { StrategyName } from "@/features/retrieval/strategies";

export interface GoldenEntry {
  chunkId: string;
  documentTitle: string;
  chunkIndex: number;
  queries: {
    literal: string;
    conversational: string;
  } | null;
}

export type Difficulty = "literal" | "conversational";

export interface Task {
  query: string;
  difficulty: Difficulty;
  expectedChunkId: string;
  expectedDoc: string;
  expectedIndex: number;
}

export interface QueryResult {
  difficulty: Difficulty;
  position: number | null;
}

export interface StrategyMetrics {
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
