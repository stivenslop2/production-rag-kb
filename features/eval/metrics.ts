import type { StrategyName } from "@/features/retrieval/strategies";
import type { QueryResult, StrategyMetrics } from "./types";

export const PRECISION_K = 5;

export function calculateMetrics(
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
