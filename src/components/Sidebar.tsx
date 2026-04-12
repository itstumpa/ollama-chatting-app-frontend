import {type Session } from "../types";
import "./Sidebar.css";

interface Props {
  sessions: Session[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
}

export default function Sidebar({ sessions, activeSessionId, onSelectSession, onNewChat }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaySessions = sessions.filter((s) => s.createdAt >= today);
  const olderSessions = sessions.filter((s) => s.createdAt < today);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand">
          <div className="brand-icon">L</div>
          <span className="brand-name">LlamaChat</span>
        </div>
        <button className="new-chat-btn" onClick={onNewChat} title="New chat">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New chat
        </button>
      </div>

      <nav className="sessions-list">
        {todaySessions.length > 0 && (
          <div className="session-group">
            <div className="group-label">Today</div>
            {todaySessions.map((s) => (
              <button
                key={s.id}
                className={`session-item ${s.id === activeSessionId ? "active" : ""}`}
                onClick={() => onSelectSession(s.id)}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.5 }}>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span>{s.title}</span>
              </button>
            ))}
          </div>
        )}
        {olderSessions.length > 0 && (
          <div className="session-group">
            <div className="group-label">Previous</div>
            {olderSessions.map((s) => (
              <button
                key={s.id}
                className={`session-item ${s.id === activeSessionId ? "active" : ""}`}
                onClick={() => onSelectSession(s.id)}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.5 }}>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span>{s.title}</span>
              </button>
            ))}
          </div>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="model-info">
          <div className="model-dot" />
          <span>llama3.2 · Ollama local</span>
        </div>
      </div>
    </aside>
  );
}
