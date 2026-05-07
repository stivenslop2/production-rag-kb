export const CHUNK_SIZE = 1000;
export const CHUNK_OVERLAP = 200;

const SEPARATORS = ["\n\n", "\n", ". ", " "];

export interface Chunk {
  content: string;
  chunkIndex: number;
}

export function chunkText(text: string): Chunk[] {
  const pieces = splitRecursive(text, SEPARATORS);
  const merged = mergeWithOverlap(pieces);
  return merged.map((content, chunkIndex) => ({ content, chunkIndex }));
}

function splitRecursive(text: string, separators: string[]): string[] {
  if (text.length <= CHUNK_SIZE) {
    return [text];
  }

  if (separators.length === 0) {
    return forceSplit(text);
  }

  const [separator, ...rest] = separators;
  const parts = text.split(separator);
  const result: string[] = [];

  for (const part of parts) {
    if (part.length <= CHUNK_SIZE) {
      result.push(part);
    } else {
      result.push(...splitRecursive(part, rest));
    }
  }

  return result;
}

function forceSplit(text: string): string[] {
  const result: string[] = [];
  for (let i = 0; i < text.length; i += CHUNK_SIZE) {
    result.push(text.slice(i, i + CHUNK_SIZE));
  }
  return result;
}

function mergeWithOverlap(pieces: string[]): string[] {
  const chunks: string[] = [];
  let current = "";

  for (const piece of pieces) {
    const candidate = current ? `${current}\n\n${piece}` : piece;

    if (candidate.length <= CHUNK_SIZE) {
      current = candidate;
      continue;
    }

    if (current) {
      chunks.push(current);
      const overlap = current.slice(-CHUNK_OVERLAP);
      current = `${overlap}\n\n${piece}`;
    } else {
      current = piece;
    }
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}