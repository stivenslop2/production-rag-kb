import { chunkText } from "@/features/ingestion/chunker";
import fs from "node:fs";
import path from "node:path";


const file = fs.readFileSync(
  path.join(process.cwd(), "data/docs/getting-started.md"),
  "utf-8",
);

const chunks = chunkText(file);

console.log(`Total chunks: ${chunks.length}`);
console.log("---");
chunks.forEach((chunk) => {
  console.log(`\n[chunk ${chunk.chunkIndex}] (${chunk.content.length} chars)`);
  console.log(chunk.content.slice(0, 150) + "...");
});