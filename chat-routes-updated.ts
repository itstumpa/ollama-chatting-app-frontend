// src/routes/chat.routes.ts — replace your existing file with this

import { Router } from "express";
import { sendMessage } from "../controllers/chat.controller";
import { streamMessage } from "../controllers/chat.controller";

const router = Router();

router.post("/", sendMessage);          // regular
router.post("/stream", streamMessage);  // streaming SSE

export default router;
