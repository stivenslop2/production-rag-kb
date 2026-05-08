import { SearchResult } from "../ingestion/types";
import { bm25Search } from "./bm25Search";
import { vectorSearch } from "./vectorSearch";

const RRF_K = 60;

export async function hybridSearch(
  query: string,
  limit: number = 20,
): Promise<SearchResult[]> {
  const [vectorResults, bm25Results] = await Promise.all([
    vectorSearch(query, limit),
    bm25Search(query, limit),
  ]);

  return rrfFusion(vectorResults, bm25Results, limit);
}

function rrfFusion(
  vectorResults: SearchResult[],
  bm25Results: SearchResult[],
  limit: number,
): SearchResult[] {
  const scoreMap = new Map<string, { result: SearchResult; score: number }>();

  vectorResults.forEach((result, index) => {
    const rank = index + 1;
    const rrfScore = 1 / (RRF_K + rank);
    scoreMap.set(result.id, { result, score: rrfScore });
  });

  bm25Results.forEach((result, index) => {
    const rank = index + 1;
    const rrfScore = 1 / (RRF_K + rank);
    const existing = scoreMap.get(result.id);

    if (existing) {
      existing.score += rrfScore;
    } else {
      scoreMap.set(result.id, { result, score: rrfScore });
    }
  });

  return Array.from(scoreMap.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ result, score }) => ({ ...result, score }));
}