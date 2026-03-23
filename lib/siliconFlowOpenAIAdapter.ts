import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";
import OpenAI from "openai";
import {
  getSdkClientOptions,
  OpenAIAdapter,
  type OpenAIAdapterParams,
} from "@copilotkit/runtime";

/**
 * CopilotKit 默认 OpenAIAdapter.getLanguageModel() 使用 `createOpenAI()(model)`，
 * 在 @ai-sdk/openai v3 中会走 **Responses API**（`/v1/responses`）。
 * 硅基流动等兼容网关仅支持 **Chat Completions**（`/v1/chat/completions`），会 404。
 *
 * 本适配器改为 `createOpenAI(...).chat(model)`，与流式 chat 协议一致。
 */
export class SiliconFlowCompatibleOpenAIAdapter extends OpenAIAdapter {
  constructor(params?: OpenAIAdapterParams) {
    super(params);
  }

  override getLanguageModel(): LanguageModel {
    const client = (this as unknown as { ensureOpenAI(): OpenAI }).ensureOpenAI();
    const options = getSdkClientOptions(client);
    const provider = createOpenAI({
      baseURL: client.baseURL,
      apiKey: client.apiKey,
      organization: client.organization ?? undefined,
      project: client.project ?? undefined,
      headers: options.defaultHeaders,
      fetch: options.fetch,
    });
    return provider.chat(this.model);
  }
}
