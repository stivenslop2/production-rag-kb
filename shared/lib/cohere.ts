import { CohereClient } from "cohere-ai";

const token = process.env.COHERE_API_KEY;

if (!token) {
  throw new Error("Missing COHERE_API_KEY in environment");
}

export const cohere = new CohereClient({ token });

export const RERANK_MODEL = "rerank-english-v3.0";