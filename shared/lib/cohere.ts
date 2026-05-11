import { CohereClientV2 } from "cohere-ai";

const token = process.env.COHERE_API_KEY;

if (!token) {
  throw new Error("Missing COHERE_API_KEY in environment");
}

export const cohere = new CohereClientV2({ token });

export const RERANK_MODEL = "rerank-v3.5";