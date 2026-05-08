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