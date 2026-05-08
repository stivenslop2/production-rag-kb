import { vectorSearch } from "../features/retrieval/vectorSearch";

async function main() {
  const query = process.argv[2] ?? "How do I verify webhook signatures?";

  console.log(`Query: "${query}"\n`);

  const results = await vectorSearch(query, 5);

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