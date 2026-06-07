"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useConversations } from "@/lib/hooks/useConversations";
import { ConversationItem } from "./ConversationItem";
import { PlusIcon } from "./icons";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { data: conversations = [], isLoading } = useConversations();
  const pathname = usePathname();
  const router = useRouter();

  const activeId = pathname?.startsWith("/c/")
    ? decodeURIComponent(pathname.slice(3))
    : null;

  const newChat = () => {
    onNavigate?.();
    router.push("/");
  };

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex items-center justify-between px-3 py-3">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-2 px-1 text-[0.95rem] font-semibold"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-sm text-accent-fg">
            C
          </span>
          CodePilot
        </Link>
      </div>

      <div className="px-3 pb-2">
        <button
          onClick={newChat}
          className="flex w-full items-center gap-2 rounded-lg border border-border bg-elevated px-3 py-2 text-sm font-medium transition-colors hover:bg-hover"
        >
          <PlusIcon width={16} height={16} />
          New chat
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {isLoading ? (
          <SidebarSkeleton />
        ) : conversations.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-muted">
            No conversations yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {conversations.map((c) => (
              <li key={c.id}>
                <ConversationItem
                  conversation={c}
                  active={c.id === activeId}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        )}
      </nav>

      <div className="border-t border-border px-4 py-3 text-xs text-muted">
        {conversations.length} conversation
        {conversations.length === 1 ? "" : "s"}
      </div>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <ul className="flex animate-pulse flex-col gap-1 px-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="h-8 rounded-lg bg-hover" />
      ))}
    </ul>
  );
}
