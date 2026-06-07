"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api, type Conversation } from "@/lib/api";

export const conversationsKey = ["conversations"] as const;

export function useConversations() {
  return useQuery({
    queryKey: conversationsKey,
    queryFn: () => api.listConversations(),
    staleTime: 30_000,
  });
}

export function useCreateConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input?: { title?: string }) => api.createConversation(input),
    onSuccess: (conv) => {
      qc.setQueryData<Conversation[]>(conversationsKey, (old = []) => [
        conv,
        ...old,
      ]);
    },
  });
}

export function useDeleteConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteConversation(id),
    // Optimistic removal so the list updates instantly.
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: conversationsKey });
      const prev = qc.getQueryData<Conversation[]>(conversationsKey);
      qc.setQueryData<Conversation[]>(conversationsKey, (old = []) =>
        old.filter((c) => c.id !== id),
      );
      return { prev };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(conversationsKey, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: conversationsKey }),
  });
}

export function useRenameConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      api.renameConversation(id, title),
    onSuccess: (conv) => {
      qc.setQueryData<Conversation[]>(conversationsKey, (old = []) =>
        old.map((c) => (c.id === conv.id ? conv : c)),
      );
    },
  });
}
