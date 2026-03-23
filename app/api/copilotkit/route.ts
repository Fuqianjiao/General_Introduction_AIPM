// app/api/copilotkit/route.ts
import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { BuiltInAgent } from "@copilotkitnext/agent";
import { SiliconFlowCompatibleOpenAIAdapter } from "@/lib/siliconFlowOpenAIAdapter";
import OpenAI from "openai";
import { NextRequest } from "next/server";
import {
  SILICONFLOW_API_KEY_HEADER,
  SILICONFLOW_DEFAULT_API_KEY,
} from "@/lib/siliconflow-defaults";
import { patchOpenAIClientForSiliconFlow } from "@/lib/patchOpenAIForSiliconFlow";

const baseURL =
  process.env.SILICONFLOW_BASE_URL?.trim() || "https://api.siliconflow.cn/v1";

/**
 * 硅基流动会调整上架模型；旧 ID（如 Qwen2.5-72B）若已下线，上游会返回 HTTP 404，
 * 前端表现为 AI_APICallError: Not Found。默认改用文档中仍列出的 Qwen3 系列。
 * @see https://docs.siliconflow.cn/cn/api-reference/chat-completions/chat-completions
 */
const DEFAULT_MODEL = "Qwen/Qwen3-14B";
const model = process.env.SILICONFLOW_MODEL?.trim() || DEFAULT_MODEL;

/**
 * 优先级：请求头（用户在站内「API」保存的 Key）> SILICONFLOW_API_KEY 环境变量 > 代码内默认
 */
function resolveApiKey(req: NextRequest): string {
  const fromHeader = req.headers.get(SILICONFLOW_API_KEY_HEADER)?.trim();
  if (fromHeader) return fromHeader;
  const fromEnv = process.env.SILICONFLOW_API_KEY?.trim();
  if (fromEnv) return fromEnv;
  return SILICONFLOW_DEFAULT_API_KEY.trim();
}

/** 供 GET 健康检查：不暴露 Key，仅告知前端是否可走「零浏览器配置」 */
function serverHasConfiguredSiliconflowKey(): boolean {
  return Boolean(
    process.env.SILICONFLOW_API_KEY?.trim() || SILICONFLOW_DEFAULT_API_KEY.trim(),
  );
}

/** 按 API Key 缓存 Hono handler，避免每请求重建 Runtime（更稳、更快） */
const handleByApiKey = new Map<string, (req: NextRequest) => Promise<Response>>();

function getHandleForApiKey(apiKey: string) {
  let run = handleByApiKey.get(apiKey);
  if (run) return run;

  const openai = new OpenAI({
    apiKey,
    baseURL,
  });
  patchOpenAIClientForSiliconFlow(openai);

  const serviceAdapter = new SiliconFlowCompatibleOpenAIAdapter({
    openai,
    model,
    /**
     * 旧版 OpenAIAdapter.process() 路径上的并行关闭（若运行时走该路径仍生效）。
     */
    disableParallelToolCalls: true,
  });

  /**
   * CopilotKit 默认用 BuiltInAgent + AI SDK streamText(getLanguageModel)。
   * 该路径**不会**读取 OpenAIAdapter.disableParallelToolCalls，需在 providerOptions 显式关闭并行 tool，
   * 否则多工具同轮仍可能触发「Cannot send RUN_FINISHED while tool calls are still active」。
   */
  const copilotRuntime = new CopilotRuntime({
    agents: {
      default: new BuiltInAgent({
        model: serviceAdapter.getLanguageModel(),
        providerOptions: {
          openai: {
            parallelToolCalls: false,
          },
        },
      }),
    },
  });

  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime: copilotRuntime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  run = (req: NextRequest) => Promise.resolve(handleRequest(req));
  handleByApiKey.set(apiKey, run);
  return run;
}

/**
 * 浏览器发请求会带自定义头，触发 OPTIONS 预检，须导出 OPTIONS。
 */
async function guardAndHandle(req: NextRequest) {
  const apiKey = resolveApiKey(req);
  if (!apiKey) {
    return Response.json(
      {
        error: "configuration_error",
        message: "未配置有效的硅基流动 API Key。",
      },
      { status: 500 },
    );
  }

  const handleRequest = getHandleForApiKey(apiKey);
  return handleRequest(req);
}

export const POST = (req: NextRequest) => guardAndHandle(req);
export const OPTIONS = (req: NextRequest) => guardAndHandle(req);

/** 健康检查：确认路由存在；不参与 CopilotKit 协议 */
export async function GET() {
  return Response.json({
    ok: true,
    service: "copilotkit",
    baseURL,
    model,
    /** true：访客无需在网页填写 Key 即可对话（环境变量或服务端兜底） */
    serverKeyConfigured: serverHasConfiguredSiliconflowKey(),
    tip: "若仍 Not Found：检查 SILICONFLOW_MODEL；另需保证兼容网关支持流式 /v1/chat/completions（CopilotKit 已把 beta.stream 代理到标准路径以适配硅基流动）。",
  });
}
