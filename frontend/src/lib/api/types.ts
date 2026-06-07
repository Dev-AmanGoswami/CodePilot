// Domain types shared by every adapter. Keep these in sync with your backend DTOs.

export type Role = "user" | "assistant";

export interface Conversation {
  id: string;
  title: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface Message {
  id: string;
  conversationId: string;
  role: Role;
  content: string;
  createdAt: string; // ISO 8601
}

export interface SendMessageParams {
  conversationId: string;
  content: string;
  /** Called with each streamed chunk of the assistant's reply. */
  onToken?: (chunk: string) => void;
  /** Abort an in-flight request. */
  signal?: AbortSignal;
}

export interface SendMessageResult {
  userMessage: Message;
  assistantMessage: Message;
}

/**
 * The single contract the UI depends on. Swap the implementation (mock <-> http)
 * without touching any component or hook.
 */
export interface ChatApi {
  listConversations(): Promise<Conversation[]>;
  createConversation(input?: { title?: string }): Promise<Conversation>;
  renameConversation(id: string, title: string): Promise<Conversation>;
  deleteConversation(id: string): Promise<void>;

  listMessages(conversationId: string): Promise<Message[]>;
  sendMessage(params: SendMessageParams): Promise<SendMessageResult>;
}
