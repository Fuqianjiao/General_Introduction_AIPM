/**
 * 硅基流动 Key 解析（服务端 app/api/copilotkit）：
 * 请求头 x-siliconflow-api-key（仅当用户在浏览器「API」里自填并保存时由前端带上）
 * → 环境变量 SILICONFLOW_API_KEY（.env.local / Vercel，推荐，小白用户零配置）
 * → 本常量兜底（可留空；公开仓库建议留空并只配环境变量）。
 *
 * 前端默认不带头，故访客不会收到打包进页面的 Key；Vercel 只需配置 SILICONFLOW_API_KEY 即可。
 */
export const SILICONFLOW_DEFAULT_API_KEY =
  "sk-xgnefafwdqiumczgdfujadsymwadibhzsnojtignfgpqigkp";

/** 浏览器自定义 Key 通过该请求头传给 /api/copilotkit（需与 CopilotProviders 一致） */
export const SILICONFLOW_API_KEY_HEADER = "x-siliconflow-api-key";

export const SILICONFLOW_USER_KEY_STORAGE = "siliconflow_api_key";
