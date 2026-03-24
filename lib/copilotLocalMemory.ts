/**
 * 本地持久化对话记忆（刷新后仍在），供 useCopilotReadable 注入模型上下文。
 * - recent：最近 3 条消息（user/assistant 文本摘要）
 * - longTerm：滚动摘要，随新回复追加，有长度上限
 */
const STORAGE_KEY = "fuqianjiao_copilot_memory_v1";
const LONG_TERM_MAX = 2000;
const SNIPPET_MAX = 320;

export type StoredChatMemory = {
  recent: { role: string; text: string }[];
  longTerm: string;
  updatedAt: string;
};

function clip(s: string, n: number) {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length <= n ? t : `${t.slice(0, n)}…`;
}

export function loadChatMemory(): StoredChatMemory {
  if (typeof window === "undefined") {
    return { recent: [], longTerm: "", updatedAt: "" };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw?.trim()) return { recent: [], longTerm: "", updatedAt: "" };
    const p = JSON.parse(raw) as StoredChatMemory;
    if (!p || !Array.isArray(p.recent)) return { recent: [], longTerm: "", updatedAt: "" };
    return {
      recent: p.recent.slice(-3),
      longTerm: typeof p.longTerm === "string" ? p.longTerm : "",
      updatedAt: typeof p.updatedAt === "string" ? p.updatedAt : "",
    };
  } catch {
    return { recent: [], longTerm: "", updatedAt: "" };
  }
}

export function saveChatMemory(next: StoredChatMemory) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* quota / private mode */
  }
}

/** 从 Copilot visibleMessages（GQL 形态）提取纯文本 */
export function messageToSnippet(m: { role?: string; content?: string }): { role: string; text: string } | null {
  const role = m.role ?? "unknown";
  const text = typeof m.content === "string" ? m.content : "";
  if (!text.trim()) return null;
  return { role, text: clip(text, SNIPPET_MAX) };
}

export function mergeMemoryFromMessages(
  prev: StoredChatMemory,
  snippets: { role: string; text: string }[],
): StoredChatMemory {
  const recent = snippets.slice(-3);
  let longTerm = prev.longTerm;
  const lastAssistant = [...snippets].reverse().find((s) => s.role === "assistant");
  if (lastAssistant) {
    const line = `[${new Date().toLocaleString("zh-CN", { hour12: false })}] 助手曾答：${lastAssistant.text}`;
    longTerm = longTerm ? `${longTerm}\n${line}` : line;
    if (longTerm.length > LONG_TERM_MAX) {
      longTerm = longTerm.slice(longTerm.length - LONG_TERM_MAX);
    }
  }
  return {
    recent,
    longTerm,
    updatedAt: new Date().toISOString(),
  };
}
