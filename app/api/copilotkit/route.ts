// app/api/copilotkit/route.ts
import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import OpenAI from "openai";
import { NextRequest } from "next/server";
import {
  SILICONFLOW_API_KEY_HEADER,
  SILICONFLOW_DEFAULT_API_KEY,
} from "@/lib/siliconflow-defaults";

const baseURL =
  process.env.SILICONFLOW_BASE_URL?.trim() || "https://api.siliconflow.cn/v1";
const model =
  process.env.SILICONFLOW_MODEL?.trim() || "Qwen/Qwen2.5-72B-Instruct";

/**
 * 优先级：用户请求头（浏览器自填）> 环境变量 > 代码内默认 Key
 */
function resolveApiKey(req: NextRequest): string {
  const fromHeader = req.headers.get(SILICONFLOW_API_KEY_HEADER)?.trim();
  if (fromHeader) return fromHeader;
  const fromEnv = process.env.SILICONFLOW_API_KEY?.trim();
  if (fromEnv) return fromEnv;
  return SILICONFLOW_DEFAULT_API_KEY.trim();
}

/**
 * 浏览器发 GraphQL 时会带自定义头，触发 OPTIONS 预检，须导出 OPTIONS。
 * 按请求解析 Key，因此每个请求创建独立 Runtime + Adapter（体量可接受）。
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

  const openai = new OpenAI({
    apiKey,
    baseURL,
  });

  const copilotRuntime = new CopilotRuntime();
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime: copilotRuntime,
    serviceAdapter: new OpenAIAdapter({
      openai,
      model,
    }),
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
}

export const POST = (req: NextRequest) => guardAndHandle(req);
export const OPTIONS = (req: NextRequest) => guardAndHandle(req);
