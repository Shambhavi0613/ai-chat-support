export interface Message {
    id: string;
    conversationId: string;
    sender: "user" | "ai";
    text: string;
    timestamp: Date;
  }
  
  export interface Conversation {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    messages: Message[];
  }
  
  export interface ChatRequest {
    message: string;
    sessionId?: string;
  }
  
  export interface ChatResponse {
    reply: string;
    sessionId: string;
  }
  
  export interface ErrorResponse {
    error: string;
    message: string;
  }