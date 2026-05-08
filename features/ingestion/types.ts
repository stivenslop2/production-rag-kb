export interface DocumentMetadata {
  id: string;
  title: string;
  description: string | null;
  sourceUrl: string | null;
  category: string;
}

export interface ParsedDocument {
  metadata: DocumentMetadata;
  content: string;
}

export interface ChunkWithEmbedding {
  chunkIndex: number;
  content: string;
  embedding: number[];
}

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