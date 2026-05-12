import { bm25Search } from "./bm25Search";
import { hybridSearch } from "./hybridSearch";
import { searchPipeline } from "./searchPipeline";
import { vectorSearch } from "./vectorSearch";

export type StrategyName = "hybrid+rerank" | "hybrid" | "vector" | "bm25";

export async function runStrategy(
  name: StrategyName,
  query: string,
  topN: number,
): Promise<string[]> {
  switch (name) {
    case "hybrid+rerank": {
      const results = await searchPipeline(query, {
        candidatesPerSearch: topN,
        topN,
      });
      return results.map((r) => r.id);
    }
    case "hybrid": {
      const results = await hybridSearch(query, {
        candidatesPerSearch: topN,
        limit: topN,
      });
      return results.map((r) => r.id);
    }
    case "vector": {
      const results = await vectorSearch(query, topN);
      return results.map((r) => r.id);
    }
    case "bm25": {
      const results = await bm25Search(query, topN);
      return results.map((r) => r.id);
    }
  }
}