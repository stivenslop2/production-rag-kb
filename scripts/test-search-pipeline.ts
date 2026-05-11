import { searchPipeline } from "../features/retrieval/searchPipeline";

async function main() {
  const query = process.argv.slice(2).join(" ") || "what error code do I get when rate limited";

  console.log(`Query: "${query}"\n`);

  const results = await searchPipeline(query);

  console.log(`Final top ${results.length} results:\n`);
  results.forEach((r) => {
    console.log(
      `${r.rerankPosition + 1}. [${r.documentId} #${r.chunkIndex}] rerank: ${r.rerankScore.toFixed(4)} | RRF: ${r.score.toFixed(4)} | vRank: ${r.vectorRank} | bm25Rank: ${r.bm25Rank}`,
    );
    console.log(`   ${r.content.slice(0, 100).replace(/\n/g, " ")}...\n`);
  });
}

main().catch((err) => {
  console.error("Pipeline test failed:", err);
  process.exit(1);
});