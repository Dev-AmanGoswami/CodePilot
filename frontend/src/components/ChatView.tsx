"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@/lib/hooks/useChat";
import { useCreateConversation } from "@/lib/hooks/useConversations";
import { stashPending, takePending } from "@/lib/pending";
import { Composer } from "./Composer";
import { MessageList } from "./MessageList";

/**
 * conversationId === null  -> landing screen (creates a conversation on first send)
 * conversationId is set    -> live conversation
 */
export function ChatView({ conversationId }: { conversationId: string | null }) {
  if (conversationId === null) return <Landing />;
  return <Conversation conversationId={conversationId} />;
}

function Landing() {
  const router = useRouter();
  const create = useCreateConversation();

  const handleSend = async (text: string) => {
    const conv = await create.mutateAsync({ title: text });
    stashPending(conv.id, text); // delivered to the conversation page on mount
    router.push(`/c/${conv.id}`);
  };

  return (
    <div className="flex h-full flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <h1 className="mb-8 text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          How can I help you today?
        </h1>
        <Composer
          onSend={handleSend}
          busy={create.isPending}
          autoFocus
        />
      </div>
    </div>
  );
}

function Conversation({ conversationId }: { conversationId: string }) {
  const { messages, isLoading, isSending, streaming, send, stop } =
    useChat(conversationId);

  // Pick up the first message handed over from the landing composer.
  useEffect(() => {
    const pending = takePending(conversationId);
    if (pending) send(pending);
    // send is stable per conversationId; takePending is idempotent (one-shot).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const empty = !isLoading && messages.length === 0 && streaming === null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        {empty ? (
          <div className="flex h-full items-center justify-center text-muted">
            Start the conversation below.
          </div>
        ) : (
          <MessageList messages={messages} streaming={streaming} />
        )}
      </div>
      <div className="border-t border-border bg-bg">
        <div className="mx-auto w-full max-w-3xl px-4 py-3">
          <Composer
            onSend={send}
            onStop={stop}
            busy={isSending}
            autoFocus
          />
        </div>
      </div>
    </div>
  );
}
