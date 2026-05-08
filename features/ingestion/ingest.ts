
import { chunkText } from "./chunker";
import { readAllDocs } from "./readDocs";
import { embedTexts } from "@/shared/lib/embeddings";
import {
  deleteChunksByDocument,
  insertChunks,
  upsertDocument,
} from "./store";
import type { ChunkWithEmbedding, ParsedDocument } from "./types";

export interface IngestResult {
  documentId: string;
  chunksCreated: number;
}

export async function ingestAllDocs(): Promise<IngestResult[]> {
  const docs = await readAllDocs();
  console.log(`Found ${docs.length} documents to ingest`);

  const results: IngestResult[] = [];

  for (const doc of docs) {
    const result = await ingestDoc(doc);
    results.push(result);
    console.log(
      `  ✓ ${result.documentId} — ${result.chunksCreated} chunks`,
    );
  }

  return results;
}

async function ingestDoc(doc: ParsedDocument): Promise<IngestResult> {
  await upsertDocument(doc.metadata);
  await deleteChunksByDocument(doc.metadata.id);

  const chunks = chunkText(doc.content);

  if (chunks.length === 0) {
    return { documentId: doc.metadata.id, chunksCreated: 0 };
  }

  const embeddings = await embedTexts(chunks.map((c) => c.content));

  const chunksWithEmbeddings: ChunkWithEmbedding[] = chunks.map((chunk, i) => ({
    chunkIndex: chunk.chunkIndex,
    content: chunk.content,
    embedding: embeddings[i],
  }));

  await insertChunks(doc.metadata.id, chunksWithEmbeddings);

  return {
    documentId: doc.metadata.id,
    chunksCreated: chunksWithEmbeddings.length,
  };
}