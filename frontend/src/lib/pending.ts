// Carries the first message from the "/" landing composer to the freshly
// created conversation page, so we don't pre-create empty conversations.
const pending = new Map<string, string>();

export const stashPending = (conversationId: string, content: string) =>
  pending.set(conversationId, content);

export function takePending(conversationId: string): string | undefined {
  const value = pending.get(conversationId);
  pending.delete(conversationId);
  return value;
}
