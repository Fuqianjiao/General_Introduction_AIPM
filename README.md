# 傅倩娇 · AI产品经理个人品牌网站

基于 **Next.js 14 + CopilotKit** 构建，集成硅基流动大模型 API，包含赛博朋克风格的 AI 对话球。

## 快速启动

### 1. 安装依赖
```bash
npm install
```

### 2. 配置 API Key（推荐配环境变量，小白零操作）

**默认**：访客不在浏览器填 Key 时，请求由服务端读取 **`SILICONFLOW_API_KEY`**（本地 `.env.local`、Vercel 环境变量），Key **不会**打进前端包。

**优先级**（服务端）：① 用户在站内 **「API」** 自填并保存的 Key（浏览器 `localStorage`，随请求头带上）→ ② `SILICONFLOW_API_KEY` → ③ `lib/siliconflow-defaults.ts` 内常量兜底（可留空，公开仓库建议只配环境变量）。

本地可编辑 `.env.local`（复制 `.env.example`）：
```
SILICONFLOW_API_KEY=你的硅基流动APIKey
SILICONFLOW_MODEL=Qwen/Qwen3-14B
SILICONFLOW_BASE_URL=https://api.siliconflow.cn/v1
```

若出现 **`AI_APICallError: Not Found`**：

1. **最常见（已在本仓库修复）**：CopilotKit 依赖的 `@ai-sdk/openai` 默认走 **`/v1/responses`**，硅基流动不支持；本仓库用 **`SiliconFlowCompatibleOpenAIAdapter`** 强制走 **`/v1/chat/completions`**，并对官方 `openai.beta.chat.completions.stream` 做了兼容补丁（见 `lib/siliconFlowOpenAIAdapter.ts`、`lib/patchOpenAIForSiliconFlow.ts`）。
2. **其次**：`SILICONFLOW_MODEL` 在控制台已下线或拼写错误（如旧 ID `Qwen2.5-72B`）。请核对文档后更新模型名并重启 dev。

**本地冒烟（需已 `npm run dev` 且配置 Key）**：`GET http://localhost:3000/api/copilotkit` 应返回 JSON；再用 `curl` 发 `agent/run` 应出现 `TEXT_MESSAGE_CONTENT` 事件（详见仓库内 `app/api/copilotkit/route.ts` 注释）。

### 3. 本地运行
```bash
npm run dev
```
打开 http://localhost:3000

## 部署到 Vercel

1. 把代码推送到 GitHub
2. 登录 [vercel.com](https://vercel.com)，Import 你的 GitHub 仓库
3. 在 Vercel 项目 **Settings → Environment Variables** 添加（与本地 `.env.local` 同名即可，部署后访客无需在网页填 Key）：
   - `SILICONFLOW_API_KEY` = 你的API Key
   - `SILICONFLOW_MODEL` = Qwen/Qwen3-14B
   - `SILICONFLOW_BASE_URL` = https://api.siliconflow.cn/v1
4. Deploy

## AI Bot 功能说明

### Function Calling（可视化）
- `navigateToPage` — AI 可以直接控制页面跳转
- `showProjectHighlights` — 展示项目亮点卡片（带加载动画）
- `showAiNotebookOpinion` — 展示 AI 笔记产品洞察卡片
- `getContactInfo` — 展示联系方式卡片
- `useCopilotReadable` — 将完整简历数据注入 AI 上下文

### 快捷提问
- 核心项目 / AI笔记观点 / 岗位匹配 / 联系方式

## 文件结构

```
fuqianjiao-ai/
├── app/
│   ├── layout.tsx          ← 全局布局 + CopilotKit Provider
│   ├── page.tsx            ← 页面路由
│   ├── globals.css         ← 赛博朋克主题样式
│   └── api/copilotkit/
│       └── route.ts        ← CopilotKit 后端（连接硅基流动）
├── components/
│   ├── AiBot.tsx           ← AI 对话球（等离子动画+CopilotChat）
│   ├── MainPage.tsx        ← 主页所有内容
│   ├── ProjectPage.tsx     ← 千牛项目 STAR 详解
│   └── Project2Page.tsx    ← 飞棋RPA项目 STAR 详解
├── lib/
│   ├── resumeData.ts                  ← 简历知识库
│   ├── siliconFlowOpenAIAdapter.ts   ← 硅基流动：强制 Chat Completions（非 Responses）
│   └── patchOpenAIForSiliconFlow.ts  ← 兼容 beta.stream → 标准流式 chat
├── .env.local              ← API Keys（不上传 GitHub）
└── .gitignore
```
