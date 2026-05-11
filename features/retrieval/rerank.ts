import { cohere, RERANK_MODEL } from "../../shared/lib/cohere";
import { RerankResult } from "./types";



export async function rerank(
  query: string,
  texts: string[],
  topN?: number,
): Promise<RerankResult[]> {
  if (texts.length === 0) {
    return [];
  }

  const response = await cohere.rerank({
    model: RERANK_MODEL,
    query,
    documents: texts,
    topN,
  });

  return response.results.map((r) => ({
    index: r.index,
    relevanceScore: r.relevanceScore,
  }));
}