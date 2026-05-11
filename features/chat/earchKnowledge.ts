import { tool } from "ai";
import { z } from "zod";
import { searchPipeline } from "../retrieval/searchPipeline";

const HIGH_CONFIDENCE_THRESHOLD = 0.5;
const LOW_CONFIDENCE_THRESHOLD = 0.2;

function classifyConfidence(topScore: number): "high" | "medium" | "low" {
  if (topScore >= HIGH_CONFIDENCE_THRESHOLD) return "high";
  if (topScore >= LOW_CONFIDENCE_THRESHOLD) return "medium";
  return "low";
}

export const searchKnowledge = tool({
  description:
    "Search the Orbiill documentation knowledge base for information relevant to the user's question. Use this whenever the user asks about Orbiill features, API, SDK, webhooks, errors, or any technical aspect of the product. If the result confidence is 'low', consider reformulating your query and searching again.",
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        "A focused search query in English. Reformulate the user's question into specific keywords if needed. Examples: 'rate limit error code', 'HMAC webhook signature verification', 'SDK error handling pattern'.",
      ),
  }),
  execute: async ({ query }) => {
    const results = await searchPipeline(query);

    if (results.length === 0) {
      return {
        found: false,
        confidence: "low" as const,
        chunks: [],
      };
    }

    const topScore = results[0].rerankScore;

    return {
      found: topScore >= LOW_CONFIDENCE_THRESHOLD,
      confidence: classifyConfidence(topScore),
      chunks: results.map((r) => ({
        id: r.id,
        documentTitle: r.documentTitle,
        chunkIndex: r.chunkIndex,
        content: r.content,
        relevanceScore: Number(r.rerankScore.toFixed(4)),
      })),
    };
  },
});