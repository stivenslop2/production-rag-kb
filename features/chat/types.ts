export interface ToolPart {
  type: string;
  toolCallId: string;
  state?: string;
  input?: { query?: string };
  output?: {
    found?: boolean;
    confidence?: string;
    chunks?: Array<{
      id: string;
      documentTitle: string;
      chunkIndex: number;
      content: string;
      relevanceScore: number;
    }>;
  };
}
