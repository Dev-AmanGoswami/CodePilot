import { mockAdapter } from "./mock-adapter";
import { httpAdapter } from "./http-adapter";
import type { ChatApi } from "./types";

// Pick the adapter at build time from the env. Defaults to mock so the app
// runs with zero backend. Flip to "http" once your APIs are live.
const mode = process.env.NEXT_PUBLIC_API_MODE ?? "mock";

export const api: ChatApi = mode === "http" ? httpAdapter : mockAdapter;

export * from "./types";
