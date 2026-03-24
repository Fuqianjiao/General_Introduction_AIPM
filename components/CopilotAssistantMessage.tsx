"use client";

/**
 * 自定义助手消息：有结构化卡片（generative UI）时，卡片与助手正文**同时**展示（正文在上/下依 position），
 * 以便展示「卡片 + ≤25 字承接」；仅当本回合**无正文**且仅有卡片时，才只显示卡片。
 * 无卡片时走普通 Markdown 气泡。
 *
 * CopilotKit 在一次回复里可能连续插入多条 role=assistant 的消息（如工具卡片与后续正文），
 * 若每条都画操作栏会出现两行相同的操作栏 —— 仅在「连续助手段」的最后一条展示操作栏；
 * 复制会拼接该段内所有助手消息的文本，视为一次完整回复。
 */
import { useState } from "react";
import { Markdown, useChatContext, type AssistantMessageProps } from "@copilotkit/react-ui";
import type { Message } from "@copilotkit/shared";

function getMessageText(m: Message | undefined): string {
  if (!m || typeof m !== "object" || !("content" in m)) return "";
  return String((m as { content?: unknown }).content ?? "").trim();
}

function hasMessageGenerative(m: Message | undefined): boolean {
  if (!m || typeof m !== "object") return false;
  const mm = m as { generativeUI?: unknown; subComponent?: unknown };
  return Boolean(mm.generativeUI || mm.subComponent);
}

/** 按「一轮回复（直到下一条 user）」聚合助手正文，供复制为一次完整回复 */
function collectAssistantTurnPlainText(messages: Message[], selfIndex: number): string {
  if (selfIndex < 0 || selfIndex >= messages.length) return "";

  let start = selfIndex;
  while (start > 0 && messages[start - 1]?.role !== "user") {
    start--;
  }
  let end = selfIndex;
  while (end < messages.length - 1 && messages[end + 1]?.role !== "user") {
    end++;
  }

  const parts: string[] = [];
  for (let i = start; i <= end; i++) {
    const m = messages[i];
    if (m?.role !== "assistant") continue;
    const t = getMessageText(m);
    if (t) parts.push(t);
  }
  return parts.join("\n\n");
}

export function CopilotAssistantMessage(props: AssistantMessageProps) {
  const { icons, labels } = useChatContext();
  const {
    rawData: _rawData,
    message,
    isLoading,
    isGenerating = false,
    onRegenerate,
    onCopy,
    onThumbsUp,
    onThumbsDown,
    isCurrentMessage,
    feedback,
    markdownTagRenderers,
    messages: messagesProp,
  } = props;

  const [copied, setCopied] = useState(false);
  const rawContent = message?.content ?? "";
  const contentTrim = String(rawContent).trim();

  const messages: Message[] = messagesProp ?? [];
  const selfId = message?.id;
  const selfIndex = selfId != null ? messages.findIndex((m) => m.id === selfId) : -1;
  const resolvedSelfIndex =
    selfIndex >= 0 ? selfIndex : messages.findIndex((m) => m === (message as unknown as Message));

  const turnStart =
    resolvedSelfIndex < 0
      ? -1
      : (() => {
          let i = resolvedSelfIndex;
          while (i > 0 && messages[i - 1]?.role !== "user") i--;
          return i;
        })();
  const turnEndExclusive =
    resolvedSelfIndex < 0
      ? -1
      : (() => {
          let i = resolvedSelfIndex + 1;
          while (i < messages.length && messages[i]?.role !== "user") i++;
          return i;
        })();

  const hasPreviousDisplayableAssistantInTurn =
    resolvedSelfIndex > turnStart &&
    messages
      .slice(turnStart, resolvedSelfIndex)
      .some((m) => m.role === "assistant" && (getMessageText(m) || hasMessageGenerative(m)));

  const hasLaterDisplayableAssistantInTurn =
    resolvedSelfIndex >= 0 &&
    turnEndExclusive >= 0 &&
    messages
      .slice(resolvedSelfIndex + 1, turnEndExclusive)
      .some((m) => m.role === "assistant" && (getMessageText(m) || hasMessageGenerative(m)));

  const fullReplyTextForCopy =
    resolvedSelfIndex >= 0
      ? collectAssistantTurnPlainText(messages, resolvedSelfIndex)
      : rawContent.trim();

  const handleCopy = () => {
    const text = fullReplyTextForCopy || rawContent.trim();
    if (!text) return;
    if (onCopy) {
      void navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy(text);
      setTimeout(() => setCopied(false), 2000);
    } else {
      void navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const subComponent = message?.generativeUI?.() ?? props.subComponent;
  const subComponentPosition = message?.generativeUIPosition ?? "after";
  const renderBefore = Boolean(subComponent && subComponentPosition === "before");
  const renderAfter = Boolean(subComponent && subComponentPosition !== "before");
  const hasGenerative = Boolean(subComponent);
  /** 只要有模型正文就展示气泡（含「卡片 + 短承接」）；勿因存在卡片而隐藏正文，否则会出现空白气泡 */
  const showMarkdownBubble = Boolean(contentTrim);
  const toolsOnlyLayout = hasGenerative && !contentTrim;

  /** 本段结束、无卡片、无文字（模型未返回或流式异常） */
  const isEmptyTerminalReply =
    !hasLaterDisplayableAssistantInTurn &&
    !isLoading &&
    !isGenerating &&
    !contentTrim &&
    !hasGenerative &&
    !hasPreviousDisplayableAssistantInTurn;

  const showActionBar =
    !hasLaterDisplayableAssistantInTurn &&
    !isLoading &&
    !isGenerating &&
    (showMarkdownBubble || hasGenerative || (isEmptyTerminalReply && !hasPreviousDisplayableAssistantInTurn));

  const Controls = () => (
    <div className={`copilotKitMessageControls ${isCurrentMessage ? "currentMessage" : ""}`}>
      <button
        type="button"
        className="copilotKitMessageControlButton"
        onClick={handleCopy}
        aria-label={labels.copyToClipboard}
        title={labels.copyToClipboard}
      >
        {copied ? (
          <span style={{ fontSize: "10px", fontWeight: "bold" }}>✓</span>
        ) : (
          icons.copyIcon
        )}
      </button>
      <button
        type="button"
        className="copilotKitMessageControlButton"
        onClick={() => onRegenerate?.()}
        aria-label={labels.regenerateResponse}
        title={labels.regenerateResponse}
      >
        {icons.regenerateIcon}
      </button>
      {onThumbsUp && message ? (
        <button
          type="button"
          className={`copilotKitMessageControlButton ${feedback === "thumbsUp" ? "active" : ""}`}
          onClick={() => onThumbsUp(message!)}
          aria-label={labels.thumbsUp}
          title={labels.thumbsUp}
        >
          {icons.thumbsUpIcon}
        </button>
      ) : null}
      {onThumbsDown && message ? (
        <button
          type="button"
          className={`copilotKitMessageControlButton ${feedback === "thumbsDown" ? "active" : ""}`}
          onClick={() => onThumbsDown(message!)}
          aria-label={labels.thumbsDown}
          title={labels.thumbsDown}
        >
          {icons.thumbsDownIcon}
        </button>
      ) : null}
    </div>
  );

  return (
    <div
      className={`copilotKitMessage copilotKitAssistantMessage${toolsOnlyLayout ? " copilot-assistant-tools-only" : ""}`}
      data-message-role="assistant"
    >
      {renderBefore ? <div style={{ marginBottom: "0.5rem" }}>{subComponent}</div> : null}

      {renderAfter && subComponent ? (
        <div style={{ marginBottom: showMarkdownBubble ? 8 : 4 }}>{subComponent}</div>
      ) : null}

      {showMarkdownBubble ? (
        <Markdown content={rawContent} components={markdownTagRenderers} />
      ) : null}

      {isEmptyTerminalReply ? (
        <div
          style={{
            fontSize: 12,
            color: "rgba(232, 234, 240, 0.45)",
            lineHeight: 1.55,
            padding: "4px 0 2px",
          }}
        >
          未收到文字回复，可点下方重新生成，或换一种问法试试。
        </div>
      ) : null}

      {showActionBar ? <Controls /> : null}

      {isLoading && !hasGenerative ? <span>{icons.activityIcon}</span> : null}
    </div>
  );
}
