const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// regular chat (no streaming)
export const sendMessage = async (sessionId: string, message: string): Promise<string> => {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, message }),
  });
  if (!res.ok) throw new Error("Chat request failed");
  const data = await res.json();
  return data.response;
};

// streaming chat — calls onChunk per token, onDone when complete
export const sendMessageStream = async (
  sessionId: string,
  message: string,
  onChunk: (chunk: string) => void,
  onDone: () => void
) => {
  try {
    const res = await fetch(`${BASE_URL}/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, message }),
    });

    if (!res.ok || !res.body) {
      // fallback to regular if streaming not available
      const text = await sendMessage(sessionId, message);
      onChunk(text);
      onDone();
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const raw = decoder.decode(value, { stream: true });
      // SSE format: "data: <token>\n\n"
      const lines = raw.split("\n").filter((l) => l.startsWith("data: "));
      for (const line of lines) {
        const token = line.replace("data: ", "").trim();
        if (token === "[DONE]") break;
        if (token) onChunk(token);
      }
    }
  } catch (err) {
    console.error("Stream error:", err);
    onChunk("\n\n[Error: Could not connect to backend]");
  } finally {
    onDone();
  }
};

// upload PDF for RAG
export const uploadPDF = async (file: File): Promise<{ chunks: number }> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE_URL}/rag/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return { chunks: data.chunks || 0 };
};

// RAG chat
export const sendRagMessage = async (
  sessionId: string,
  question: string
): Promise<string> => {
  const res = await fetch(`${BASE_URL}/rag/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, question }),
  });
  if (!res.ok) throw new Error("RAG request failed");
  const data = await res.json();
  return data.response;
};
