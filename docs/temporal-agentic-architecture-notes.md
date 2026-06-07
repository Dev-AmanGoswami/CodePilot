# CodePilot — Moving the Agentic Loop to Temporal (Learning Notes)

> Conversation notes — saved 2026-06-06. Topic: redesigning the synchronous LLM
> tool-calling loop into a parallel, durable, status-streaming architecture using
> Temporal. (Concepts only — no implementation yet.)

---

## The goal

In CodePilot, a user pastes a query in the frontend; the backend calls an LLM,
which decides which tools to run (grep tool, glob tool, CLI tools) in the workspace
folder. Currently this is **synchronous** — the user waits while the whole loop runs.

We want to:
- Run the task asynchronously / in parallel via Temporal.
- Have each unit of work report status: **thinking**, **error**, **done**.
- Persist the conversation.

---

## 1. Fix the vocabulary first (this matters a lot)

Three Temporal words have very specific meanings, and they're easy to mix up:

- **Worker** — a long-running *process* you start that hosts your workflow and
  activity code. You run a *small number* of them (like server instances). A worker
  is **NOT** "one per task" — it's a pool of capacity that picks up work.
- **Workflow** — the *orchestrator*. Durable code that decides "what happens next."
  It coordinates; it does not do the heavy lifting. Its state is persisted by
  Temporal, so if the process crashes mid-run, it resumes where it left off.
- **Activity** — a single *unit of real work* with side effects: call the LLM, run
  grep, run a CLI command, write to the DB. Activities are what actually "do things,"
  and they're what get retried on failure.

> Correct framing: *"The task is an **Activity**, orchestrated by a **Workflow**,
> executed on a pool of **Workers**, and each Activity reports status."*

---

## 2. The mental model shift

**Current synchronous version** — one request thread holds the whole loop:

```
user query → LLM → "call grep" → run grep → feed result back → LLM →
"call cli" → run cli → ... → LLM → final answer → return to user
```

The user's HTTP request is held open the whole time. That's what we're killing.

**New model — split into two halves:**

1. **Submit half (fast):** User fires a query → create a conversation record →
   start a Temporal workflow → immediately return a `sessionId`/`workflowId`.
   The HTTP request ends in milliseconds.
2. **Run half (durable, async):** The workflow runs the agentic loop in the
   background on workers, emitting status as it goes. The frontend watches status
   separately.

This decoupling is the whole point: the request no longer waits for the work.

---

## 3. Where the agentic loop lives

The agentic loop itself becomes the **workflow**:

```
Workflow(query):
  history = [query]
  loop:
    decision = callLLM_Activity(history)      # an activity
    if decision is "final answer": break
    results = run all requested tools         # activities, possibly in parallel
    history += results
  return final answer
```

Each `callLLM` and each tool execution is an **activity**. The workflow is just the
glue and the decision points. Temporal records every activity's input/output, so the
loop is crash-proof and replayable.

---

## 4. The parallelism question (be precise)

Two very different kinds of parallelism:

**1. Parallel tool calls within one LLM turn.**
When the LLM says "run grep AND glob AND read 3 files," those are independent. Fire
all those activities concurrently and wait for all to finish (**fan-out / fan-in**).
Easy in a workflow — start N activities without awaiting, then await them together.

**2. Parallel *subtasks* of the overall goal.**
"Break the task into multiple tasks in parallel" only works when the LLM can actually
*decompose* the goal into independent branches (e.g. "refactor module A" and
"refactor module B" don't depend on each other). This is a **planner pattern**:
one LLM call produces a plan of N subtasks → spawn N child workflows (or N parallel
activity chains) → join the results. (CodePilot's `TodoPlannerService` is this planner.)

> **Caveat:** the agentic loop is often *inherently sequential* (step 2 needs
> step 1's output). Don't force parallelism where there's a data dependency.
> Parallelize the independent parts only.

---

## 5. The hard part — streaming status back (thinking / error / done)

**Temporal is NOT a streaming/pub-sub system.** Workflows are built for durability,
not for pushing live updates to a browser. So you need a *separate channel* for status.

**Pattern A — Activities write status to a store; frontend reads it. (RECOMMENDED)**
- Each activity writes status rows/events ("thinking", "running grep", "error",
  "done") into your DB (or Redis) as it progresses.
- Frontend gets live updates via **SSE (Server-Sent Events)** or WebSocket from the
  Spring API — or simply polls an endpoint.
- The DB is the source of truth; the workflow never talks to the browser directly.
- Most common and robust approach.

**Pattern B — Temporal Queries.**
- Temporal lets you *query* a running workflow for its current in-memory state.
- Good for "what's the status right now" pulls, but it's a **snapshot, not a stream**,
  and not meant for high-frequency polling or full event history.

> For a chat UI with thinking/error/done streaming, use **Pattern A with SSE.**
>
> - **Temporal** → durability & orchestration (survives crashes, retries tools)
> - **DB + SSE** → live status feed to the user

---

## 6. Persisting the conversation

Two layers of persistence — don't conflate them:

- **Temporal's history** persists the *execution* (which activities ran, their
  results) for fault tolerance and replay. Automatic. **Not** your conversation
  store — don't query it as one.
- **Your own DB** persists the *conversation* — messages, roles, tool calls,
  statuses, final answers — for display, history, and audit. (CodePilot's
  `SessionService` / `MessageService` are this layer.)

Flow: when an activity produces a meaningful event (LLM message, tool result, status
change), it writes a message/event record to your DB via `MessageService`. The
conversation is rebuilt from your DB, never from Temporal internals.

> **Idempotency:** activities should be idempotent for writes, because Temporal
> retries them. Use a deterministic ID (e.g. `workflowId + step`) so a retry
> overwrites rather than duplicates messages.

---

## 7. The whole flow together

```
1. User submits query
2. SessionController → SessionService creates conversation row, saves user message
3. TemporalClientService starts the workflow, returns sessionId immediately
4. Frontend opens an SSE connection to /sessions/{id}/stream
5. Workflow runs on a worker:
     - LLM activity → writes "thinking" status + message to DB
     - LLM decides tools → fan-out tool activities (parallel where independent)
     - each tool activity → writes status + result to DB
     - loop until final answer → writes "done"
     - on failure → activity retries; if exhausted, writes "error"
6. Each DB write → API pushes the event down the SSE stream
7. Frontend renders thinking / results / error / done in real time
```

---

## 8. Things to study next, in order

1. **Temporal core concepts** — Workflow vs Activity vs Worker vs Task Queue.
   Get this rock solid first; everything depends on it.
2. **Workflow determinism rules** — why you can't call `LLM` / `random` / `now()`
   directly inside workflow code (only inside activities). Trips up everyone.
3. **Activity retries & idempotency** — retry policies, and why writes must be safe
   to repeat.
4. **Fan-out / fan-in** — running multiple activities concurrently and joining.
5. **Child workflows** — for the planner-decomposes-into-subtasks pattern.
6. **SSE in Spring** (`SseEmitter`) — for the live status feed.
7. **Signals & Queries** — signals to send input *into* a running workflow (cancel,
   follow-up); queries to pull state.

---

## 9. One design decision to make early

Decide your **streaming source of truth** now — it shapes everything:

- **DB-as-truth + SSE** (Pattern A): most robust, survives reconnects, free history.
  Slightly more write traffic.
- **Temporal Query polling** (Pattern B): less infra, but snapshot-only, weaker UX
  for a live "thinking" feed.

> For a chat UI with thinking/error/done → go with **DB-as-truth + SSE**. It's what
> production agentic systems do.

---

## Open follow-ups for next session

- How the agentic loop maps onto workflow code (and why LLM calls *must* be activities).
- How fan-out/fan-in for parallel tools works in detail.
- How to wire SSE to DB events.
- Conceptual data model for the conversation/status tables.
