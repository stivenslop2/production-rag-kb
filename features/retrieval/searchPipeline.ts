import { hybridSearch } from "./hybridSearch";
import { rerank } from "./rerank";
import { RerankedResult } from "@/shared/types";

const DEFAULT_CANDIDATES_PER_SEARCH = 20;
const DEFAULT_TOP_N = 5;

interface SearchPipelineOptions {
  candidatesPerSearch?: number;
  topN?: number;
}

export async function searchPipeline(
  query: string,
  options: SearchPipelineOptions = {},
): Promise<RerankedResult[]> {
  const candidatesPerSearch = options.candidatesPerSearch ?? DEFAULT_CANDIDATES_PER_SEARCH;
  const topN = options.topN ?? DEFAULT_TOP_N;

  const candidates = await hybridSearch(query, {
    candidatesPerSearch,
    limit: candidatesPerSearch,
  });

  if (candidates.length === 0) {
    return [];
  }

  const texts = candidates.map((c) => c.content);
  const rerankResults = await rerank(query, texts, topN);

  return rerankResults.map((r, position) => ({
    ...candidates[r.index],
    rerankScore: r.relevanceScore,
    rerankPosition: position,
  }));
}