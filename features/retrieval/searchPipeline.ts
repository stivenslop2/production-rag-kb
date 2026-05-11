import { hybridSearch } from "./hybridSearch";
import { rerank } from "./rerank";
import { RerankedResult } from "./types";

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

  // Paso 1: Hybrid search trae los candidatos
  const candidates = await hybridSearch(query, {
    candidatesPerSearch,
    limit: candidatesPerSearch,
  });

  if (candidates.length === 0) {
    return [];
  }

  // Paso 2: Rerank con Cohere
  const texts = candidates.map((c) => c.content);
  const rerankResults = await rerank(query, texts, topN);

  // Paso 3: Mapear índices de Cohere de vuelta a los HybridSearchResult completos
  return rerankResults.map((r, position) => ({
    ...candidates[r.index],
    rerankScore: r.relevanceScore,
    rerankPosition: position,
  }));
}