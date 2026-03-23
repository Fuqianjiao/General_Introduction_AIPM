/**
 * 硅基流动：内置默认 Key（仅服务端使用）。
 * 优先级：请求头 x-siliconflow-api-key > 环境变量 SILICONFLOW_API_KEY > 本默认值。
 * 生产环境建议只用环境变量，勿将敏感 Key 提交到公开仓库。
 */
export const SILICONFLOW_DEFAULT_API_KEY =
  "sk-xgnefafwdqiumczgdfujadsymwadibhzsnojtignfgpqigkp";

/** 浏览器自定义 Key 通过该请求头传给 /api/copilotkit（需与 CopilotProviders 一致） */
export const SILICONFLOW_API_KEY_HEADER = "x-siliconflow-api-key";

export const SILICONFLOW_USER_KEY_STORAGE = "siliconflow_api_key";
