"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Conversation } from "@/lib/api";
import {
  useDeleteConversation,
  useRenameConversation,
} from "@/lib/hooks/useConversations";
import { PencilIcon, TrashIcon } from "./icons";

interface Props {
  conversation: Conversation;
  active: boolean;
  onNavigate?: () => void;
}

export function ConversationItem({ conversation, active, onNavigate }: Props) {
  const del = useDeleteConversation();
  const rename = useRenameConversation();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(conversation.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const startEdit = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraft(conversation.title);
    setEditing(true);
  };

  const commit = () => {
    const title = draft.trim();
    if (title && title !== conversation.title) {
      rename.mutate({ id: conversation.id, title });
    }
    setEditing(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") setEditing(false);
  };

  const handleDelete = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete "${conversation.title}"?`)) return;
    del.mutate(conversation.id, {
      onSuccess: () => {
        if (active) router.push("/");
      },
    });
  };

  if (editing) {
    return (
      <div className="px-2">
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={onKeyDown}
          className="w-full rounded-lg border border-accent bg-elevated px-2 py-2 text-sm outline-none"
        />
      </div>
    );
  }

  return (
    <Link
      href={`/c/${conversation.id}`}
      onClick={onNavigate}
      className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
        active ? "bg-hover font-medium" : "hover:bg-hover"
      }`}
    >
      <span className="flex-1 truncate" title={conversation.title}>
        {conversation.title}
      </span>
      <span className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <button
          onClick={startEdit}
          aria-label="Rename conversation"
          className="rounded p-1 text-muted hover:bg-border hover:text-fg"
        >
          <PencilIcon width={14} height={14} />
        </button>
        <button
          onClick={handleDelete}
          aria-label="Delete conversation"
          className="rounded p-1 text-muted hover:bg-border hover:text-fg"
        >
          <TrashIcon width={14} height={14} />
        </button>
      </span>
    </Link>
  );
}
