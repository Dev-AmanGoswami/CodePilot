"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { SendIcon, StopIcon } from "./icons";

interface Props {
  onSend: (text: string) => void;
  onStop?: () => void;
  busy?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
}

export function Composer({
  onSend,
  onStop,
  busy,
  autoFocus,
  placeholder = "Message CodePilot…",
}: Props) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  // Auto-grow the textarea up to a cap.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  const submit = useCallback(() => {
    const text = value.trim();
    if (!text || busy) return;
    onSend(text);
    setValue("");
  }, [value, busy, onSend]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex items-end gap-2 rounded-3xl border border-border bg-elevated px-3 py-2 shadow-sm transition-colors focus-within:border-muted">
        <textarea
          ref={ref}
          rows={1}
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="max-h-[200px] flex-1 resize-none bg-transparent px-2 py-1.5 text-[0.95rem] leading-relaxed outline-none placeholder:text-muted"
        />
        {busy ? (
          <button
            type="button"
            onClick={onStop}
            aria-label="Stop generating"
            className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-fg text-bg transition-opacity hover:opacity-80"
          >
            <StopIcon width={16} height={16} />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!value.trim()}
            aria-label="Send message"
            className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-fg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <SendIcon width={18} height={18} />
          </button>
        )}
      </div>
      <p className="mt-2 text-center text-xs text-muted">
        CodePilot can make mistakes. Press Enter to send, Shift+Enter for a new line.
      </p>
    </form>
  );
}
