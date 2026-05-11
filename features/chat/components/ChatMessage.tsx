import { UIMessage } from "ai";
import { MessageContent } from "./MessageContent";
import { ToolIndicator } from "./ToolIndicator";

interface ChatMessageProps {
  message: UIMessage;
}

interface ToolPart {
  type: string;
  toolCallId: string;
  state?: string;
  input?: { query?: string };
  output?: unknown;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  if (isUser) {
    const text = message.parts
      .filter((p) => p.type === "text")
      .map((p) => (p as { type: "text"; text: string }).text)
      .join("");

    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl bg-[#1E40AF] px-4 py-2.5 text-white">
          {text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] w-full">
        {message.parts.map((part, idx) => {
          // Texto normal del assistant
          if (part.type === "text") {
            return (
              <MessageContent
                key={idx}
                content={(part as { type: "text"; text: string }).text}
              />
            );
          }

          // Tool calls — el type viene como "tool-{toolName}"
          if (part.type.startsWith("tool-")) {
            const toolPart = part as ToolPart;
            const toolName = part.type.replace("tool-", "");
            const isDone = toolPart.output !== undefined;

            return (
              <ToolIndicator
                key={idx}
                toolName={toolName}
                state={isDone ? "done" : "running"}
                query={toolPart.input?.query}
              />
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}