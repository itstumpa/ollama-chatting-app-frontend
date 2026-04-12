import { useState, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import type { Session } from "./types";
import type { Message } from "./types";
import { sendMessage, sendMessageStream } from "./api/chat";
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

    // update title from first message
    updateSession(activeSessionId, (s) => ({
      ...s,
      title: s.messages.length === 0 ? text.slice(0, 36) : s.title,
      messages: [...s.messages, userMsg],
    }));

    setIsStreaming(true);

    if (useStream) {
      const aiMsgId = (Date.now() + 1).toString();
      const aiMsg: Message = { role: "ai", content: "", id: aiMsgId };

      updateSession(activeSessionId, (s) => ({
        ...s,
        messages: [...s.messages, userMsg, aiMsg],
      }));

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
    } else {
      try {
        const response = await sendMessage(activeSessionId, text);
        const aiMsg: Message = {
          role: "ai",
          content: response,
          id: (Date.now() + 1).toString(),
        };
        updateSession(activeSessionId, (s) => ({
          ...s,
          messages: [...s.messages, userMsg, aiMsg],
        }));
      } finally {
        setIsStreaming(false);
      }
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
