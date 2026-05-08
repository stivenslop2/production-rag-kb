import { ingestAllDocs } from "../features/ingestion/ingest";

async function main() {
  const start = Date.now();

  console.log("Starting ingestion...\n");

  const results = await ingestAllDocs();

  const totalChunks = results.reduce((sum, r) => sum + r.chunksCreated, 0);
  const elapsed = ((Date.now() - start) / 1000).toFixed(2);

  console.log(`\nIngestion complete in ${elapsed}s`);
  console.log(`  ${results.length} documents`);
  console.log(`  ${totalChunks} chunks`);
}

main().catch((err) => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});