"use client";

import { useEffect, useRef } from "react";
import type { Message as MessageType } from "@/lib/api";
import { Message } from "./Message";

interface Props {
  messages: MessageType[];
  streaming: string | null;
}

export function MessageList({ messages, streaming }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Keep the view pinned to the latest content as it streams in.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, streaming]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
      {messages.map((m) => (
        <Message key={m.id} role={m.role} content={m.content} />
      ))}
      {streaming !== null && (
        <Message
          role="assistant"
          content={streaming || ""}
          streaming
        />
      )}
      <div ref={bottomRef} />
    </div>
  );
}
