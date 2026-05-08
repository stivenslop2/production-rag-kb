import { supabase } from "@/shared/lib/supabase";
import { embedQuery } from "@/shared/lib/embeddings";
import { SearchResult } from "../ingestion/types";

export async function vectorSearch(
  query: string,
  limit: number = 20,
): Promise<SearchResult[]> {
  const queryEmbedding = await embedQuery(query);

  const { data, error } = await supabase.rpc("rag_kb_vector_search", {
    query_embedding: queryEmbedding,
    match_count: limit,
  });

  if (error) {
    throw new Error(`Vector search failed: ${error.message}`);
  }

  return data as SearchResult[];
}