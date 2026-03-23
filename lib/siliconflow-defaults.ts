/**
 * 硅基流动：内置默认 Key（服务端 resolveApiKey 兜底；亦由 CopilotProviders 写入请求头，进页即绑定）。
 * 服务端优先级：请求头 x-siliconflow-api-key > SILICONFLOW_API_KEY > 本常量。
 * 客户端请求头优先级：localStorage 覆盖 > NEXT_PUBLIC_SILICONFLOW_API_KEY > 本常量。
 * 公开仓库建议删除默认常量，改用环境变量。
 */
export const SILICONFLOW_DEFAULT_API_KEY =
  "sk-xgnefafwdqiumczgdfujadsymwadibhzsnojtignfgpqigkp";

/** 浏览器自定义 Key 通过该请求头传给 /api/copilotkit（需与 CopilotProviders 一致） */
export const SILICONFLOW_API_KEY_HEADER = "x-siliconflow-api-key";

export const SILICONFLOW_USER_KEY_STORAGE = "siliconflow_api_key";
