"use client";

import dynamic from "next/dynamic";
import { memo } from "react";
import type { Role } from "@/lib/api";

// Lazy-load the markdown renderer so it stays out of the initial bundle.
const Markdown = dynamic(
  () => import("./Markdown").then((m) => m.Markdown),
  { ssr: false, loading: () => null },
);

interface Props {
  role: Role;
  content: string;
  streaming?: boolean;
}

function MessageImpl({ role, content, streaming }: Props) {
  if (role === "user") {
    return (
      <div className="flex justify-end animate-fade-in">
        <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl bg-user-bubble px-4 py-2.5 text-[0.95rem] leading-relaxed">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent text-[0.8rem] font-semibold text-accent-fg">
        C
      </div>
      <div className="min-w-0 flex-1 pt-0.5 text-[0.95rem]">
        <Markdown content={content} />
        {streaming && (
          <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-blink bg-fg align-middle" />
        )}
      </div>
    </div>
  );
}

export const Message = memo(MessageImpl);
