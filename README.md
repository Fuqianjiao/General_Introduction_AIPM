# 傅倩娇 · AI产品经理个人品牌网站

基于 **Next.js 14 + CopilotKit** 构建，集成硅基流动大模型 API，包含赛博朋克风格的 AI 对话球。

## 快速启动

### 1. 安装依赖
```bash
npm install
```

### 2. 配置 API Key（可选）

**优先级**：① 用户在 AI 对话框标题栏点 **「API」** 自填的 Key（仅存浏览器）→ ② `.env.local` 里的 `SILICONFLOW_API_KEY` → ③ 代码内默认（`lib/siliconflow-defaults.ts`，公开仓库建议删除默认 Key，只保留环境变量）。

本地可编辑 `.env.local`（复制 `.env.example`）：
```
SILICONFLOW_API_KEY=你的硅基流动APIKey
SILICONFLOW_MODEL=Qwen/Qwen2.5-72B-Instruct
SILICONFLOW_BASE_URL=https://api.siliconflow.cn/v1
```

### 3. 本地运行
```bash
npm run dev
```
打开 http://localhost:3000

## 部署到 Vercel

1. 把代码推送到 GitHub
2. 登录 [vercel.com](https://vercel.com)，Import 你的 GitHub 仓库
3. 在 Vercel 项目 Settings → Environment Variables 添加：
   - `SILICONFLOW_API_KEY` = 你的API Key
   - `SILICONFLOW_MODEL` = Qwen/Qwen2.5-72B-Instruct
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
│   └── resumeData.ts       ← 简历知识库（AI Bot 数据源）
├── .env.local              ← API Keys（不上传 GitHub）
└── .gitignore
```
