import { supabase } from "@/shared/lib/supabase";
import type { ChunkWithEmbedding, DocumentMetadata } from "./types";

export async function upsertDocument(
  metadata: DocumentMetadata,
): Promise<void> {
  const { error } = await supabase.from("rag_kb_documents").upsert({
    id: metadata.id,
    title: metadata.title,
    description: metadata.description,
    source_url: metadata.sourceUrl,
    category: metadata.category,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(`Failed to upsert document ${metadata.id}: ${error.message}`);
  }
}

export async function deleteChunksByDocument(documentId: string): Promise<void> {
  const { error } = await supabase
    .from("rag_kb_chunks")
    .delete()
    .eq("document_id", documentId);

  if (error) {
    throw new Error(
      `Failed to delete chunks for document ${documentId}: ${error.message}`,
    );
  }
}

export async function insertChunks(
  documentId: string,
  chunks: ChunkWithEmbedding[],
): Promise<void> {
  if (chunks.length === 0) {
    return;
  }

  const rows = chunks.map((chunk) => ({
    document_id: documentId,
    chunk_index: chunk.chunkIndex,
    content: chunk.content,
    embedding: chunk.embedding,
  }));

  const { error } = await supabase.from("rag_kb_chunks").insert(rows);

  if (error) {
    throw new Error(
      `Failed to insert chunks for document ${documentId}: ${error.message}`,
    );
  }
}