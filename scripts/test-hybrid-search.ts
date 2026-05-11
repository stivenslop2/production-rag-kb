import { hybridSearch } from "../features/retrieval/hybridSearch";

async function main() {
  const query = process.argv.slice(2).join(" ") || "what error code do I get when rate limited";

  console.log(`Query: "${query}"\n`);

  const results = await hybridSearch(query, { limit: 5 });

  console.log(`Top ${results.length} results:\n`);
  results.forEach((r, i) => {
    console.log(
      `${i + 1}. [${r.documentId} #${r.chunkIndex}] RRF: ${r.score.toFixed(4)} | vRank: ${r.vectorRank} | bm25Rank: ${r.bm25Rank}`,
    );
    console.log(`   ${r.content.slice(0, 120).replace(/\n/g, " ")}...\n`);
  });
}

main().catch((err) => {
  console.error("Search failed:", err);
  process.exit(1);
});