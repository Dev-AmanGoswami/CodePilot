# CodePilot Frontend

A claude.ai-style chat web app built with **Next.js 15 (App Router) + TypeScript + Tailwind CSS + TanStack Query**.

- Sidebar to create, list, open, rename, and delete conversations
- Chat container with streaming assistant replies and markdown rendering
- Optimistic UI (instant create/delete, optimistic message send)
- Works **today** with zero backend via a localStorage mock adapter
- One typed API client — swap the mock for your real REST backend without touching components

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## How it works before the backend exists

`NEXT_PUBLIC_API_MODE=mock` (the default) uses `src/lib/api/mock-adapter.ts`:
conversations and messages persist in `localStorage`, and assistant replies are
streamed token-by-token to simulate a real LLM.

## Wiring up your backend

1. Copy `.env.local.example` to `.env.local`.
2. Set `BACKEND_URL` to your Spring service (e.g. `http://localhost:8080`).
3. Set `NEXT_PUBLIC_API_MODE=http`.
4. Implement the endpoints expected by `src/lib/api/http-adapter.ts`:

   | Method | Path                                   | Body        | Returns          |
   | ------ | -------------------------------------- | ----------- | ---------------- |
   | GET    | `/api/conversations`                   | —           | `Conversation[]` |
   | POST   | `/api/conversations`                   | `{ title? }`| `Conversation`   |
   | PATCH  | `/api/conversations/:id`               | `{ title }` | `Conversation`   |
   | DELETE | `/api/conversations/:id`               | —           | `204`            |
   | GET    | `/api/conversations/:id/messages`      | —           | `Message[]`      |
   | POST   | `/api/conversations/:id/messages`      | `{ content }`| stream or JSON  |

   The send endpoint may stream Server-Sent Events (`data: <chunk>\n\n`, ending
   with `data: [DONE]`), stream plain chunked text, or return
   `{ userMessage, assistantMessage }` JSON. The HTTP adapter handles all three.

The browser always calls same-origin `/api/*`; `next.config.mjs` proxies those
to `BACKEND_URL`, so there's no CORS to configure.

Domain types live in `src/lib/api/types.ts` — keep them in sync with your DTOs.

## Project structure

```
src/
  app/
    layout.tsx            Root layout + providers
    providers.tsx         TanStack Query client
    globals.css           Theme tokens (light/dark) + markdown styles
    (chat)/
      layout.tsx          Persistent sidebar shell
      page.tsx            "/" new-chat landing
      c/[id]/page.tsx     "/c/:id" conversation
  components/             Sidebar, ChatView, Composer, Message, ...
  lib/
    api/                  types + mock adapter + http adapter + selector
    hooks/                useConversations, useChat
    pending.ts            landing -> conversation message hand-off
```

## Scripts

- `npm run dev` — dev server
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run typecheck` — TypeScript check
