# LlamaChat UI — Setup Guide

## Stack
- React + Vite + TypeScript
- Connected to your Express/LangChain/Ollama backend

---

## Setup

### 1. Create Vite project
```bash
npm create vite@latest chat-ui -- --template react-ts
cd chat-ui
```

### 2. Copy files
Copy all files from this folder into your Vite project:
- `src/App.tsx` → replace existing
- `src/App.css` → replace existing
- `src/types/index.ts` → create folder + file
- `src/api/chat.ts` → create folder + file
- `src/components/` → copy all component files

### 3. Install deps
```bash
npm install
```

### 4. Set env
Create `.env` in root:
```
VITE_API_URL=http://localhost:5000/api
```

### 5. Run
```bash
npm run dev
```

---

## Backend — Add Streaming

### Step 1: Add streamMessage to chat.controller.ts
Copy the code from `streaming-backend.ts` and add the `streamMessage` export.

### Step 2: Update chat.routes.ts
```ts
import { sendMessage, streamMessage } from "../controllers/chat.controller";

router.post("/", sendMessage);
router.post("/stream", streamMessage);
```

### Step 3: Add CORS to your Express app
```bash
npm install cors
npm install -D @types/cors
```

```ts
// src/app.ts
import cors from "cors";
app.use(cors({ origin: "http://localhost:5173" }));
```

---

## Features
- Chat with memory (MongoDB + Redis)
- RAG mode — upload PDF, ask questions
- Streaming responses (token by token)
- Session sidebar
- Light/dark mode auto
