import type { DocumentMetadata } from "@/shared/types";

export interface ParsedDocument {
  metadata: DocumentMetadata;
  content: string;
}

export interface ChunkWithEmbedding {
  chunkIndex: number;
  content: string;
  embedding: number[];
}
