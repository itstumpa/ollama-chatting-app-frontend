// src/controllers/chat.controller.ts
// ADD this export alongside your existing sendMessage controller

import { Request, Response } from "express";
import { Ollama } from "@langchain/ollama";
import { PromptTemplate } from "@langchain/core/prompts";
import { getFromRedis, saveToRedis } from "../memory/redisMemory";
import { getHistory, saveMessage } from "../memory/mongoMemory";

const llm = new Ollama({
  baseUrl: process.env.OLLAMA_BASE_URL,
  model: "llama3.2",
});

const prompt = PromptTemplate.fromTemplate(`
  You are a helpful AI assistant.

  Previous conversation:
  {history}

  Human: {question}
  AI:
`);

export const streamMessage = async (req: Request, res: Response) => {
  try {
    const { sessionId, message } = req.body;

    if (!sessionId || !message) {
      res.status(400).json({ error: "sessionId and message required" });
      return;
    }

    // set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders();

    // load memory
    let messages = await getFromRedis(sessionId);
    if (messages.length === 0) messages = await getHistory(sessionId);

    const historyText = messages
      .map((m: any) => `${m.role === "human" ? "Human" : "AI"}: ${m.content}`)
      .join("\n");

    const formattedPrompt = await prompt.format({
      history: historyText,
      question: message,
    });

    // stream tokens
    let fullResponse = "";
    const stream = await llm.stream(formattedPrompt);

    for await (const chunk of stream) {
      fullResponse += chunk;
      // SSE format
      res.write(`data: ${chunk}\n\n`);
    }

    // signal done
    res.write("data: [DONE]\n\n");
    res.end();

    // save to memory after stream completes
    await saveToRedis(sessionId, "human", message);
    await saveToRedis(sessionId, "ai", fullResponse);
    await saveMessage(sessionId, "human", message);
    await saveMessage(sessionId, "ai", fullResponse);
  } catch (error) {
    console.error("Stream error:", error);
    res.write(`data: [ERROR]\n\n`);
    res.end();
  }
};
