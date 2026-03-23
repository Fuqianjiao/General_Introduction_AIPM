"use client";

/**
 * 自定义助手消息：只要本回合有结构化卡片（generative UI），即不渲染 Markdown 气泡，
 * 避免模型多写一段总结；仅展示卡片 + 底部操作栏。无卡片时仍走普通 Markdown 气泡。
 *
 * CopilotKit 在一次回复里可能连续插入多条 role=assistant 的消息（如工具卡片与后续正文），
 * 若每条都画操作栏会出现两行相同的再生/复制/赞踩 —— 仅在「连续助手段」的最后一条展示操作栏。
 */
import { useState } from "react";
import { Markdown, useChatContext, type AssistantMessageProps } from "@copilotkit/react-ui";
import type { Message } from "@copilotkit/shared";

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
  const contentTrim = rawContent.trim();

  const messages: Message[] = messagesProp ?? [];
  const selfId = message?.id;
  const selfIndex =
    selfId != null ? messages.findIndex((m) => m.id === selfId) : -1;
  const nextMsg =
    selfIndex >= 0 && selfIndex < messages.length - 1
      ? messages[selfIndex + 1]
      : undefined;
  /** 下一条仍是助手时，本段属于同一轮回复的中间条，不画底部操作栏 */
  const isTerminalAssistantInBlock =
    selfIndex < 0 ? Boolean(isCurrentMessage) : nextMsg?.role !== "assistant";

  const handleCopy = () => {
    if (rawContent && onCopy) {
      void navigator.clipboard.writeText(rawContent);
      setCopied(true);
      onCopy(rawContent);
      setTimeout(() => setCopied(false), 2000);
    } else if (rawContent) {
      void navigator.clipboard.writeText(rawContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const subComponent = message?.generativeUI?.() ?? props.subComponent;
  const subComponentPosition = message?.generativeUIPosition ?? "after";
  const renderBefore = Boolean(subComponent && subComponentPosition === "before");
  const renderAfter = Boolean(subComponent && subComponentPosition !== "before");
  const hasGenerative = Boolean(subComponent);
  /** 本回合已有结构化卡片时不再展示助手 Markdown 气泡，避免与卡片重复总结 */
  const showMarkdownBubble = Boolean(contentTrim && !hasGenerative);
  const toolsOnlyLayout = hasGenerative && !showMarkdownBubble;

  const showActionBar =
    isTerminalAssistantInBlock &&
    !isLoading &&
    !isGenerating &&
    (showMarkdownBubble || hasGenerative);

  const Controls = () => (
    <div className={`copilotKitMessageControls ${isCurrentMessage ? "currentMessage" : ""}`}>
      <button
        type="button"
        className="copilotKitMessageControlButton"
        onClick={() => onRegenerate?.()}
        aria-label={labels.regenerateResponse}
        title={labels.regenerateResponse}
      >
        {icons.regenerateIcon}
      </button>
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

      {showActionBar ? <Controls /> : null}

      {isLoading && !hasGenerative ? <span>{icons.activityIcon}</span> : null}
    </div>
  );
}
