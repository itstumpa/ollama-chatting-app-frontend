import { useEffect, useRef, useState } from "react";
import {type Session } from "../types";
import MessageBubble from "./MessageBubble";
import InputBar from "./InputBar";
import "./ChatWindow.css";

interface Props {
  session: Session;
  isStreaming: boolean;
  onSend: (text: string, stream?: boolean) => void;
}

const SUGGESTIONS = [
  { label: "Explain RAG", sub: "in simple terms" },
  { label: "Vector search", sub: "how does it work?" },
  { label: "My session memory", sub: "how is it stored?" },
  { label: "Upload a PDF", sub: "and ask questions about it" },
];

export default function ChatWindow({ session, isStreaming, onSend }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"chat" | "rag">("chat");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session.messages]);

  const isEmpty = session.messages.length === 0;

  return (
    <main className="chat-window">
      <header className="chat-header">
        <div className="header-left">
          <span className="header-title">
            {session.title === "New chat" ? "LlamaChat" : session.title}
          </span>
        </div>
        <div className="header-right">
          <div className="mode-toggle">
            <button
              className={`mode-btn ${mode === "chat" ? "active" : ""}`}
              onClick={() => setMode("chat")}
            >
              Chat
            </button>
            <button
              className={`mode-btn ${mode === "rag" ? "active" : ""}`}
              onClick={() => setMode("rag")}
            >
              RAG / Docs
            </button>
          </div>
          <span className="model-badge">llama3.2</span>
        </div>
      </header>

      <div className="messages-area">
        {isEmpty ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h1 className="empty-title">What can I help with?</h1>
            <p className="empty-sub">
              {mode === "rag"
                ? "Upload a PDF then ask questions about it"
                : "Powered by Ollama · llama3.2 · Memory via MongoDB + Redis"}
            </p>
            <div className="suggestions">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  className="suggestion-card"
                  onClick={() => onSend(s.label + " " + s.sub)}
                >
                  <strong>{s.label}</strong>
                  <span>{s.sub}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="messages">
            {session.messages.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isStreaming={isStreaming && i === session.messages.length - 1 && msg.role === "ai"}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

<InputBar
  isStreaming={isStreaming}
  mode={mode}
  onSend={onSend}
  sessionId={session.id}
/>
    </main>
  );
}
