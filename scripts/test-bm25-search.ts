import { bm25Search } from "../features/retrieval/bm25Search";

async function main() {
  console.log("argv:", process.argv);
  const query = process.argv[2] ?? "what error code do I get when rate limited";

  console.log(`Query: "${query}"\n`);

  const results = await bm25Search(query, 5);

  console.log(`Top ${results.length} results:\n`);
  results.forEach((r, i) => {
    console.log(
      `${i + 1}. [${r.documentId} #${r.chunkIndex}] score: ${r.score.toFixed(4)}`,
    );
    console.log(`   ${r.content.slice(0, 120).replace(/\n/g, " ")}...\n`);
  });
}

main().catch((err) => {
  console.error("Search failed:", err);
  process.exit(1);
});