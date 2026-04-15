import { useState, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import type { Session, Message } from "./types";
import {  sendMessageStream, sendRagMessage } from "./api/chat";
import "./App.css";

function generateSessionId() {
  return "session_" + Math.random().toString(36).substring(2, 10);
}

function App() {
  const [sessions, setSessions] = useState<Session[]>([
    { id: generateSessionId(), title: "New chat", messages: [], createdAt: new Date() },
  ]);
  const [activeSessionId, setActiveSessionId] = useState(sessions[0].id);
  const [isStreaming, setIsStreaming] = useState(false);

  const activeSession = sessions.find((s) => s.id === activeSessionId)!;

  const updateSession = useCallback((id: string, updater: (s: Session) => Session) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? updater(s) : s)));
  }, []);

  const handleNewChat = () => {
    const newSession: Session = {
      id: generateSessionId(),
      title: "New chat",
      messages: [],
      createdAt: new Date(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

const handleSend = async (text: string, useStream: boolean = true) => {
  if (isStreaming) return;

  const userMsg: Message = { role: "user", content: text, id: Date.now().toString() };
  const aiMsgId = (Date.now() + 1).toString();

  updateSession(activeSessionId, (s) => ({
    ...s,
    title: s.messages.length === 0 ? text.slice(0, 36) : s.title,
    messages: [...s.messages, userMsg, { role: "ai" as const, content: "", id: aiMsgId }],
  }));

  setIsStreaming(true);

  if (!useStream) {
    // RAG mode
    try {
      const response = await sendRagMessage(activeSessionId, text);
      updateSession(activeSessionId, (s) => ({
        ...s,
        messages: s.messages.map((m) =>
          m.id === aiMsgId ? { ...m, content: response } : m
        ),
      }));
    } catch {
      updateSession(activeSessionId, (s) => ({
        ...s,
        messages: s.messages.map((m) =>
          m.id === aiMsgId ? { ...m, content: "Error: could not get RAG response." } : m
        ),
      }));
    } finally {
      setIsStreaming(false);
    }
  } else {
    // stream chat mode
    await sendMessageStream(
      activeSessionId,
      text,
      (chunk) => {
        updateSession(activeSessionId, (s) => ({
          ...s,
          messages: s.messages.map((m) =>
            m.id === aiMsgId ? { ...m, content: m.content + chunk } : m
          ),
        }));
      },
      () => setIsStreaming(false)
    );
  }
};

  return (
    <div className="app-root">
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewChat={handleNewChat}
      />
      <ChatWindow
        session={activeSession}
        isStreaming={isStreaming}
        onSend={handleSend}
      />
    </div>
  );
}

export default App;