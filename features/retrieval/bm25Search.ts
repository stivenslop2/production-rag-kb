import { supabase } from "@/shared/lib/supabase";
import { SearchResult } from "./types";


export async function bm25Search(
  query: string,
  limit: number = 20,
): Promise<SearchResult[]> {
  const { data, error } = await supabase.rpc("rag_kb_bm25_search", {
    query_text: query,
    match_count: limit,
  });

  if (error) {
    throw new Error(`BM25 search failed: ${error.message}`);
  }

  return data as SearchResult[];
}