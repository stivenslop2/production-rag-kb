export interface SearchResult {
  id: string;
  documentId: string;
  documentTitle: string;
  documentSourceUrl: string | null;
  documentCategory: string;
  chunkIndex: number;
  content: string;
  score: number;
}

export interface HybridSearchResult extends SearchResult {
  vectorRank: number | null;
  bm25Rank: number | null;
}

export interface RerankedResult extends HybridSearchResult {
  rerankScore: number;
  rerankPosition: number;
}