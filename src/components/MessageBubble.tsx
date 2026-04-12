import { type Message } from "../types";
import "./MessageBubble.css";

interface Props {
  message: Message;
  isStreaming: boolean;
}

// very basic markdown-ish rendering: code blocks + inline code
function renderContent(text: string) {
  // code blocks
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith("```")) {
      const lines = part.split("\n");
      const lang = lines[0].replace("```", "").trim();
      const code = lines.slice(1, -1).join("\n");
      return (
        <pre key={i} className="code-block">
          {lang && <span className="code-lang">{lang}</span>}
          <code>{code}</code>
        </pre>
      );
    }
    // inline code
    const inline = part.split(/(`[^`]+`)/g);
    return (
      <span key={i}>
        {inline.map((chunk, j) =>
          chunk.startsWith("`") && chunk.endsWith("`") ? (
            <code key={j} className="inline-code">
              {chunk.slice(1, -1)}
            </code>
          ) : (
            <span key={j}>{chunk}</span>
          )
        )}
      </span>
    );
  });
}

export default function MessageBubble({ message, isStreaming }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={`msg-row ${isUser ? "user" : "ai"}`}>
      <div className={`avatar ${isUser ? "user" : "ai"}`}>
        {isUser ? "T" : "AI"}
      </div>
      <div className="msg-body">
        <div className="msg-name">{isUser ? "You" : "LlamaChat"}</div>
        <div className="msg-content">
          {renderContent(message.content)}
          {isStreaming && <span className="cursor" />}
        </div>
      </div>
    </div>
  );
}
