"use client";

import { useCallback, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type Message } from "@/lib/api";
import { conversationsKey } from "./useConversations";

export const messagesKey = (id: string) => ["messages", id] as const;

const tempId = () => `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`;

/**
 * Owns the message list + streaming state for one conversation.
 * Renders optimistically and reconciles with the API result.
 */
export function useChat(conversationId: string | null) {
  const qc = useQueryClient();
  const abortRef = useRef<AbortController | null>(null);
  const [streaming, setStreaming] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: messagesKey(conversationId ?? "none"),
    queryFn: () => api.listMessages(conversationId!),
    enabled: !!conversationId,
  });

  const send = useCallback(
    async (content: string) => {
      const text = content.trim();
      if (!conversationId || !text || isSending) return;

      setIsSending(true);
      setStreaming("");
      const controller = new AbortController();
      abortRef.current = controller;

      const key = messagesKey(conversationId);
      const optimisticUser: Message = {
        id: tempId(),
        conversationId,
        role: "user",
        content: text,
        createdAt: new Date().toISOString(),
      };
      qc.setQueryData<Message[]>(key, (old = []) => [...old, optimisticUser]);

      try {
        const { userMessage, assistantMessage } = await api.sendMessage({
          conversationId,
          content: text,
          signal: controller.signal,
          onToken: (chunk) => setStreaming((s) => (s ?? "") + chunk),
        });
        qc.setQueryData<Message[]>(key, (old = []) => {
          const withoutTemp = old.filter((m) => m.id !== optimisticUser.id);
          return [...withoutTemp, userMessage, assistantMessage];
        });
        qc.invalidateQueries({ queryKey: conversationsKey });
      } catch (err) {
        // Roll the optimistic message back on failure.
        qc.setQueryData<Message[]>(key, (old = []) =>
          old.filter((m) => m.id !== optimisticUser.id),
        );
        if ((err as Error)?.name !== "AbortError") throw err;
      } finally {
        setStreaming(null);
        setIsSending(false);
        abortRef.current = null;
      }
    },
    [conversationId, isSending, qc],
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);

  return { messages, isLoading, isSending, streaming, send, stop };
}
