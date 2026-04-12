import {  useRef, useState } from "react";
import {  type KeyboardEvent } from "react";
import { uploadPDF } from "../api/chat";
import "./InputBar.css";

interface Props {
  isStreaming: boolean;
  mode: "chat" | "rag";
  onSend: (text: string, stream?: boolean) => void;
  _sessionId: string;
}

export default function InputBar({ isStreaming, mode, onSend, _sessionId}: Props) {
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed, true); // always stream
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadStatus(null);
    try {
      const result = await uploadPDF(file);
      setUploadStatus(`✓ Indexed ${result.chunks} chunks from "${file.name}"`);
    } catch {
      setUploadStatus("✗ Upload failed. Check backend.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="input-area">
      {uploadStatus && (
        <div className={`upload-status ${uploadStatus.startsWith("✓") ? "success" : "error"}`}>
          {uploadStatus}
          <button onClick={() => setUploadStatus(null)}>×</button>
        </div>
      )}
      <div className="input-wrapper">
        {mode === "rag" && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <button
              className="attach-btn"
              title="Upload PDF"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spin">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                </svg>
              )}
            </button>
          </>
        )}
        <textarea
          ref={textareaRef}
          className="chat-input"
          placeholder={
            mode === "rag"
              ? "Upload a PDF then ask questions..."
              : "Message LlamaChat... (Shift+Enter for new line)"
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          onInput={handleInput}
          rows={1}
          disabled={isStreaming}
        />
        <button
          className={`send-btn ${!text.trim() || isStreaming ? "disabled" : ""}`}
          onClick={handleSend}
          disabled={!text.trim() || isStreaming}
          title="Send"
        >
          {isStreaming ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="1"/>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          )}
        </button>
      </div>
      <p className="input-hint">
        {mode === "rag"
          ? "RAG mode · answers from your uploaded documents"
          : "Chat mode · memory stored in MongoDB + Redis"}
      </p>
    </div>
  );
}
