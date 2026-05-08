import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import type { ParsedDocument } from "./types";

const DOCS_DIR = path.join(process.cwd(), "data/docs");

export async function readAllDocs(): Promise<ParsedDocument[]> {
  const files = await fs.readdir(DOCS_DIR);
  const markdownFiles = files.filter((f) => f.endsWith(".md"));

  const documents = await Promise.all(
    markdownFiles.map((file) => readDoc(path.join(DOCS_DIR, file))),
  );

  return documents;
}

async function readDoc(filePath: string): Promise<ParsedDocument> {
  const raw = await fs.readFile(filePath, "utf-8");
  const { data, content } = matter(raw);

  if (!data.id || !data.title || !data.category) {
    throw new Error(
      `Invalid frontmatter in ${filePath}: missing id, title, or category`,
    );
  }

  return {
    metadata: {
      id: data.id,
      title: data.title,
      description: data.description ?? null,
      sourceUrl: data.source_url ?? null,
      category: data.category,
    },
    content,
  };
}