import type {
  ChatApi,
  Conversation,
  Message,
  SendMessageParams,
  SendMessageResult,
} from "./types";

// localStorage-backed mock so the whole app works before any backend exists.
// Replace by setting NEXT_PUBLIC_API_MODE=http (see http-adapter.ts).

const CONV_KEY = "codepilot:conversations";
const MSG_KEY = (id: string) => `codepilot:messages:${id}`;

const isBrowser = () => typeof window !== "undefined";
const now = () => new Date().toISOString();
const uid = () =>
  (isBrowser() && crypto?.randomUUID?.()) ||
  `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode — ignore */
  }
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function deriveTitle(text: string): string {
  const t = text.trim().replace(/\s+/g, " ");
  if (!t) return "New chat";
  return t.length > 48 ? `${t.slice(0, 48)}…` : t;
}

function sortByUpdated(list: Conversation[]): Conversation[] {
  return [...list].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

// A small canned reply generator so streaming feels real in mock mode.
function fakeReply(userText: string): string {
  const trimmed = userText.trim();
  return [
    `You said: "${trimmed.length > 80 ? trimmed.slice(0, 80) + "…" : trimmed}".`,
    "",
    "This is a **mock** assistant response from the local adapter. Once your backend is ready, set `NEXT_PUBLIC_API_MODE=http` and these replies will come from your API instead.",
    "",
    "Here's a sample code block to show markdown rendering:",
    "",
    "```ts",
    "const greet = (name: string) => `Hello, ${name}!`;",
    "console.log(greet('CodePilot'));",
    "```",
    "",
    "- Conversations and messages persist in `localStorage`.",
    "- Try the sidebar to create, open, and delete chats.",
  ].join("\n");
}

export const mockAdapter: ChatApi = {
  async listConversations() {
    await delay(60);
    return sortByUpdated(read<Conversation[]>(CONV_KEY, []));
  },

  async createConversation(input) {
    await delay(60);
    const ts = now();
    const conv: Conversation = {
      id: uid(),
      title: input?.title?.trim() || "New chat",
      createdAt: ts,
      updatedAt: ts,
    };
    const list = read<Conversation[]>(CONV_KEY, []);
    write(CONV_KEY, [conv, ...list]);
    write(MSG_KEY(conv.id), []);
    return conv;
  },

  async renameConversation(id, title) {
    await delay(40);
    const list = read<Conversation[]>(CONV_KEY, []);
    const next = list.map((c) =>
      c.id === id ? { ...c, title: title.trim() || c.title, updatedAt: now() } : c,
    );
    write(CONV_KEY, next);
    const found = next.find((c) => c.id === id);
    if (!found) throw new Error("Conversation not found");
    return found;
  },

  async deleteConversation(id) {
    await delay(40);
    const list = read<Conversation[]>(CONV_KEY, []);
    write(CONV_KEY, list.filter((c) => c.id !== id));
    if (isBrowser()) window.localStorage.removeItem(MSG_KEY(id));
  },

  async listMessages(conversationId) {
    await delay(60);
    return read<Message[]>(MSG_KEY(conversationId), []);
  },

  async sendMessage({
    conversationId,
    content,
    onToken,
    signal,
  }: SendMessageParams): Promise<SendMessageResult> {
    const messages = read<Message[]>(MSG_KEY(conversationId), []);

    const userMessage: Message = {
      id: uid(),
      conversationId,
      role: "user",
      content,
      createdAt: now(),
    };
    const withUser = [...messages, userMessage];
    write(MSG_KEY(conversationId), withUser);

    // Bump conversation; set its title from the first user message.
    const convs = read<Conversation[]>(CONV_KEY, []);
    write(
      CONV_KEY,
      convs.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              updatedAt: now(),
              title:
                messages.length === 0 && (c.title === "New chat" || !c.title)
                  ? deriveTitle(content)
                  : c.title,
            }
          : c,
      ),
    );

    // Stream the reply token-by-token.
    const full = fakeReply(content);
    const tokens = full.match(/\S+\s*|\s+/g) ?? [full];
    let streamed = "";
    for (const tok of tokens) {
      if (signal?.aborted) break;
      await delay(18);
      streamed += tok;
      onToken?.(tok);
    }

    const assistantMessage: Message = {
      id: uid(),
      conversationId,
      role: "assistant",
      content: streamed,
      createdAt: now(),
    };
    write(MSG_KEY(conversationId), [...withUser, assistantMessage]);

    return { userMessage, assistantMessage };
  },
};
