import { openai, EMBEDDING_MODEL } from "@/shared/lib/openai";

export async function generateEmbeddings(
  chunks: string[],
): Promise<number[][]> {
  if (chunks.length === 0) {
    return [];
  }

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: chunks,
  });

  return response.data.map((item) => item.embedding);
}