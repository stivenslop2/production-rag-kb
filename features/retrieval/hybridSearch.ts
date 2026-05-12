import { bm25Search } from "./bm25Search";
import { vectorSearch } from "./vectorSearch";
import { HybridSearchResult, SearchResult } from "@/shared/types";

const RRF_K = 60;
const DEFAULT_CANDIDATES_PER_SEARCH = 20;
const DEFAULT_LIMIT = 20;

interface HybridSearchOptions {
  candidatesPerSearch?: number;
  limit?: number;
}

export async function hybridSearch(
  query: string,
  options: HybridSearchOptions = {},
): Promise<HybridSearchResult[]> {
  const candidatesPerSearch = options.candidatesPerSearch ?? DEFAULT_CANDIDATES_PER_SEARCH;
  const limit = options.limit ?? DEFAULT_LIMIT;

  const [vectorResults, bm25Results] = await Promise.all([
    vectorSearch(query, candidatesPerSearch),
    bm25Search(query, candidatesPerSearch),
  ]);

  return rrfFusion(vectorResults, bm25Results, limit);
}

function rrfFusion(
  vectorResults: SearchResult[],
  bm25Results: SearchResult[],
  limit: number,
): HybridSearchResult[] {
  const scoreMap = new Map<string, HybridSearchResult>();

  vectorResults.forEach((result, index) => {
    const rank = index + 1;
    const rrfScore = 1 / (RRF_K + rank);
    scoreMap.set(result.id, {
      ...result,
      score: rrfScore,
      vectorRank: rank,
      bm25Rank: null,
    });
  });

  bm25Results.forEach((result, index) => {
    const rank = index + 1;
    const rrfScore = 1 / (RRF_K + rank);
    const existing = scoreMap.get(result.id);

    if (existing) {
      existing.score += rrfScore;
      existing.bm25Rank = rank;
    } else {
      scoreMap.set(result.id, {
        ...result,
        score: rrfScore,
        vectorRank: null,
        bm25Rank: rank,
      });
    }
  });

  return Array.from(scoreMap.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}