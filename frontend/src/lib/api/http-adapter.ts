import type {
  ChatApi,
  Conversation,
  Message,
  SendMessageParams,
  SendMessageResult,
} from "./types";

// Real backend adapter. Activate with NEXT_PUBLIC_API_MODE=http.
// Requests hit /api/* (same-origin) and are proxied to BACKEND_URL via next.config.mjs.
//
// Expected endpoints (adjust paths to match your Spring controllers):
//   GET    /api/conversations
//   POST   /api/conversations                 { title? } -> Conversation
//   PATCH  /api/conversations/:id             { title }  -> Conversation
//   DELETE /api/conversations/:id
//   GET    /api/conversations/:id/messages    -> Message[]
//   POST   /api/conversations/:id/messages    { content } -> streams assistant tokens
//
// The send endpoint may either stream (text/event-stream or chunked text) or
// return JSON. Both are handled below.

const BASE = "/api";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} ${detail}`.trim());
  }
  return (await res.json()) as T;
}

export const httpAdapter: ChatApi = {
  listConversations() {
    return fetch(`${BASE}/conversations`, { cache: "no-store" }).then(
      json<Conversation[]>,
    );
  },

  createConversation(input) {
    return fetch(`${BASE}/conversations`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input ?? {}),
    }).then(json<Conversation>);
  },

  renameConversation(id, title) {
    return fetch(`${BASE}/conversations/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title }),
    }).then(json<Conversation>);
  },

  async deleteConversation(id) {
    const res = await fetch(`${BASE}/conversations/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  },

  listMessages(conversationId) {
    return fetch(
      `${BASE}/conversations/${encodeURIComponent(conversationId)}/messages`,
      { cache: "no-store" },
    ).then(json<Message[]>);
  },

  async sendMessage({
    conversationId,
    content,
    onToken,
    signal,
  }: SendMessageParams): Promise<SendMessageResult> {
    const res = await fetch(
      `${BASE}/conversations/${encodeURIComponent(conversationId)}/messages`,
      {
        method: "POST",
        headers: { "content-type": "application/json", accept: "text/event-stream" },
        body: JSON.stringify({ content }),
        signal,
      },
    );
    if (!res.ok || !res.body) {
      // Non-streaming fallback: server returned plain JSON.
      const data = await json<SendMessageResult>(res);
      onToken?.(data.assistantMessage.content);
      return data;
    }

    const contentType = res.headers.get("content-type") ?? "";
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let assistantText = "";
    let buffer = "";

    const emit = (chunk: string) => {
      if (!chunk) return;
      assistantText += chunk;
      onToken?.(chunk);
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      if (contentType.includes("text/event-stream")) {
        // Parse SSE frames: lines beginning with "data:".
        let nl: number;
        while ((nl = buffer.indexOf("\n\n")) !== -1) {
          const frame = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 2);
          for (const line of frame.split("\n")) {
            if (line.startsWith("data:")) {
              const payload = line.slice(5).trim();
              if (payload === "[DONE]") continue;
              emit(payload);
            }
          }
        }
      } else {
        // Plain chunked text stream.
        emit(buffer);
        buffer = "";
      }
    }

    const ts = new Date().toISOString();
    return {
      userMessage: {
        id: `local_${ts}`,
        conversationId,
        role: "user",
        content,
        createdAt: ts,
      },
      assistantMessage: {
        id: `local_${ts}_a`,
        conversationId,
        role: "assistant",
        content: assistantText,
        createdAt: ts,
      },
    };
  },
};
