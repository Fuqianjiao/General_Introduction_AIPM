import type OpenAI from "openai";
import { ChatCompletionStream } from "openai/lib/ChatCompletionStream.js";

/**
 * CopilotKit 的 OpenAIAdapter 使用 `client.beta.chat.completions.stream()`，
 * 对应 URL 为 `/v1/beta/chat/completions`。硅基流动等 OpenAI 兼容网关通常只实现
 * 标准 `/v1/chat/completions`，beta 路径会 404，前端即 `AI_APICallError: Not Found`。
 *
 * 将 beta.stream 代理到 SDK 自带的 `ChatCompletionStream.createChatCompletion`，
 * 内部走 `client.chat.completions.create({ ...params, stream: true })`，与官方流式协议一致。
 */
export function patchOpenAIClientForSiliconFlow(openai: OpenAI): void {
  const completions = openai.beta?.chat?.completions as
    | { stream?: (...args: unknown[]) => unknown }
    | undefined;
  if (!completions || typeof completions.stream !== "function") return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- 避免 openai 包多份类型实例导致 _options 不兼容
  completions.stream = (body: Record<string, unknown>, options?: object) =>
    ChatCompletionStream.createChatCompletion(openai as any, { ...body, stream: true } as any, options ?? {});
}
