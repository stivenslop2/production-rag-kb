import { hybridSearch } from "../features/retrieval/hybridSearch";
import { rerank } from "../features/retrieval/rerank";

async function main() {
  const query = process.argv.slice(2).join(" ") || "what error code do I get when rate limited";

  console.log(`Query: "${query}"\n`);

  const candidates = await hybridSearch(query, { limit: 20 });
  console.log(`Hybrid search returned ${candidates.length} candidates\n`);

  const texts = candidates.map((c) => c.content);
  const reranked = await rerank(query, texts);

  console.log(`Top 5 after rerank:\n`);
  reranked.slice(0, 5).forEach((r, i) => {
    const original = candidates[r.index];
    console.log(
      `${i + 1}. [${original.documentId} #${original.chunkIndex}] relevance: ${r.relevanceScore.toFixed(4)}`,
    );
    console.log(
      `   was hybrid position: ${candidates.indexOf(original) + 1} | vRank: ${original.vectorRank} | bm25Rank: ${original.bm25Rank}`,
    );
    console.log(`   ${original.content.slice(0, 100).replace(/\n/g, " ")}...\n`);
  });
}

main().catch((err) => {
  console.error("Rerank test failed:", err);
  process.exit(1);
});