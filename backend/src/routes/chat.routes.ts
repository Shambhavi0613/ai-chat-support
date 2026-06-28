import { Router, Request, Response, NextFunction } from "express";
import { generateReply } from "../services/llm.service";
import {
  getOrCreateConversation,
  saveMessages,
  getConversationHistory,
} from "../services/conversation.service";
import { validateChatInput } from "../middleware/errorHandler";
import { ChatRequest, ChatResponse } from "../types";

const router = Router();

// POST /chat/message
router.post(
  "/message",
  validateChatInput,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { message, sessionId } = req.body as ChatRequest;

      // Get or create conversation
      const conversation = await getOrCreateConversation(sessionId);

      // Get conversation history for context
      const history = await getConversationHistory(conversation.id);

      // Generate AI reply
      const reply = await generateReply(history, message.trim());

      // Save both messages to DB
      await saveMessages(conversation.id, message.trim(), reply);

      const response: ChatResponse = {
        reply,
        sessionId: conversation.id,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

// GET /chat/history/:sessionId
router.get(
  "/history/:sessionId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId } = req.params;

      const conversation = await getOrCreateConversation(sessionId);

      res.status(200).json({
        sessionId: conversation.id,
        messages: conversation.messages,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;