// lib/resumeData.ts
// 这是 AI Bot 的知识库，所有关于傅倩娇的信息都在这里
// CopilotKit 会把这些数据注入给 AI 作为上下文

export const RESUME_DATA = {
  basic: {
    name: "傅倩娇",
    age: 25,
    location: "杭州",
    hometown: "湖南",
    target: "AI产品经理",
    phone: "15673271937",
    wechat: "18711339455",
    email: "1261519462@qq.com",
    resumeLink: "https://universal.feishu.cn/file/STSzbuxVioll8Vxl1dSc3WdRnde",
  },

  education: {
    school: "河北农业大学（全日制本科）",
    major: "物联网工程",
    gpa: "3.51 (top 15%)",
    period: "2020.09 — 2024.06",
  },

  experience: [
    {
      company: "乐麦信息技术（杭州）",
      role: "低代码平台产品负责人 + AI交付产品经理",
      period: "2025.05 — 至今",
      highlights: [
        "主导飞棋RPA设计器AI能力升级：DOM→大模型语义→多路径XPath生成，动态页面定位成功率提升80%，调试耗时降低1h",
        "设计自然语言驱动指令搭建模式，四类模糊情形追问策略（目标模糊/参数缺失/意图冲突/边界不清），复杂流程搭建时间从2h压缩至1h",
        "识别任务队列级联故障风险，重新设计分层重试策略，任务丢失率降低100%，故障恢复缩短至1h",
        "主导/参与交付64个应用，覆盖天猫/抖音/京东等26个平台，70%项目7天内完成，满意度95%",
      ],
    },
    {
      company: "杭州分叉科技",
      role: "SaaS+MaaS 平台运营",
      period: "2024.07 — 2025.04",
      highlights: [
        "研究Dify/扣子等LLMOps产品，输出竞品分析报告，指导平台核心功能规划",
        "设计100+通用工作流模板，打通数据库与知识库，应用市场月活提升80%",
        "头部客户（韵达/宝尊电商）年化节省成本150W+，流程自动化率提升40%",
        "千牛全托管对话系统：多轮会话准确率91%，日均处理咨询3000+，减少人工干预60%，转化率提升27%（AB测试验证）",
      ],
    },
  ],

  projects: [
    {
      id: "qianniu",
      name: "千牛电商客服全托管对话系统",
      company: "影刀RPA",
      period: "2024.07 — 2025.01",
      metrics: {
        accuracy: "91%多轮会话准确率",
        intentRecognition: "89%意图识别准确率",
        humanReduction: "60%人工干预减少",
        conversion: "27%转化率提升（AB测试）",
        daily: "3000+日均处理咨询",
      },
      star: {
        situation: "大促期间咨询量是日常5~10倍，千牛原生机器人无法与OMS打通，转人工率高",
        task: "多轮会话准确率≥90%，日均处理3000+，自动处理率65%，实时人工介入控制15-20%",
        action: "三层串行架构：问题优化专家（5轮历史+元数据注入+fallback三级）→知识库三层召回（标准/扩展/应急）→回复专家（四级置信度梯度），反馈闭环驱动持续微调",
        result: "意图识别89%，多轮准确率91%，AB测试A组（强化上下文建模）转化率提升27%",
      },
    },
    {
      id: "feiqí",
      name: "飞棋RPA工具全链路AI能力升级",
      company: "乐麦信息技术",
      period: "2025.05 — 2026.03",
      metrics: {
        xpath: "XPath定位成功率+80%",
        buildTime: "流程搭建时间↓50%（2h→1h）",
        taskLoss: "任务丢失率降低100%",
        recovery: "故障恢复缩短至1h",
      },
      star: {
        situation: "传统XPath手动编写稳定性差；复杂流程搭建完全手工耗时2h+；任务队列存在级联故障导致任务静默丢失",
        task: "将大模型能力融入元素捕获、指令搭建、任务调度三大核心模块",
        action: "① DOM结构解析→大模型语义理解→多策略XPath生成+稳定性评分；② 自然语言四类模糊情形追问策略；③ 分层重试+跨层熔断上报机制",
        result: "XPath定位成功率+80%，搭建时间2h→1h，任务丢失率降低100%",
      },
    },
  ],

  skills: {
    ai: ["Prompt工程", "RAG知识库", "Agent工作流", "LLMOps", "意图识别", "对话系统设计", "AB测试"],
    lowcode: ["飞棋RPA", "影刀RPA", "Dify", "扣子/Coze", "飞书多维表格"],
    product: ["Axure", "墨刀", "Figma", "JIRA", "禅道", "Postman", "竞品分析"],
    certs: ["CET-6", "影刀RPA自动化高级证书"],
  },

  aiNotebookOpinions: [
    {
      id: "resource",
      title: "拓展资源来源边界：连接器 + MCP 双轨并进",
      tagline: "连接器和 MCP 本质是同一问题——知识入口太窄，洞察也无法变成行动",
      gap:
        "目前多数 AI 笔记仍以「手动上传」为主，NotebookLM 类产品更像封闭的知识消费系统：文档进去了，却很难与企业里已在使用的 SaaS（CRM、工单、IM、日历）形成闭环，也无法把「读完笔记后的结论」落成可执行任务。",
      suggestion:
        "① 参考 Claude 的连接器（Connectors）思路，提供可扩展的「主流 SaaS 直连 + OAuth」体系，降低同步成本；② 引入 MCP（Model Context Protocol）等标准，让模型在授权下调用外部工具——例如会议纪要结构化后，一键生成 Jira / 飞书任务，实现「知识 → 行动」。",
      relatedLinks: [
        {
          kind: "internal" as const,
          label: "站内：我用过 AI 笔记（NotebookLM 板块）",
          page: "main" as const,
          hash: "nblm",
        },
      ],
    },
    {
      id: "knowledge",
      title: "补足知识管理能力，而不只是知识消费",
      tagline: "「资料坟场」往往只解决了消化环节，没有解决积累与复用环节",
      gap:
        "仅有消费型问答，缺少双向链接、图谱化视图与分层标签时，笔记之间难以形成网络；时间一久，用户找不到「这条结论当初依据了哪些源」，复用成本高，也难以做团队级知识治理。",
      suggestion:
        "① 引入双向链接与轻量知识图谱，让条目之间可追踪引用关系；② 分层标签 + 命名规范，区分「事实 / 假设 / 待验证」；③ 知识健康度提示：长期未更新、缺少反向链接、与最新外部数据可能冲突等，推动持续维护。",
      relatedLinks: [
        {
          kind: "internal" as const,
          label: "站内：我对 AI 笔记的看法 & 迭代建议",
          page: "main" as const,
          hash: "nblm",
        },
        {
          kind: "internal" as const,
          label: "站内：工作经历与项目成果",
          page: "main" as const,
          hash: "projects",
        },
      ],
    },
    {
      id: "interaction",
      title: "从被动问答走向主动洞察与个性化适配",
      tagline: "习惯养成的本质是：用户感到「它越来越懂我的工作语境」",
      gap:
        "若产品长期停留在「用户问一句、模型答一句」，很难形成差异化；缺少对未读关联点的主动提示、对矛盾信息的预警，以及跨会话的稳定偏好记忆，用户粘性会停留在工具层而非工作流层。",
      suggestion:
        "① 在授权与隐私边界内做主动推送：发现新文档与旧笔记主题相关、或结论存在潜在矛盾时轻量提醒；② 用户画像与偏好（常用数据源、行业、角色）在合规前提下跨会话保持，减少重复澄清；③ 与站内项目案例（如对话系统多轮策略）对齐，强调「上下文建模」体验。",
      relatedLinks: [
        {
          kind: "internal" as const,
          label: "站内：千牛对话系统项目（多轮与上下文）",
          page: "project" as const,
        },
        {
          kind: "internal" as const,
          label: "站内：飞棋 RPA AI 升级",
          page: "project2" as const,
        },
        {
          kind: "internal" as const,
          label: "站内：AI 笔记观点全文",
          page: "main" as const,
          hash: "nblm",
        },
      ],
    },
  ],

  matchScore: {
    overall: 90,
    dimensions: [
      { name: "LLM/RAG/Agent能力理解", score: 95 },
      { name: "0→1产品设计经验", score: 90 },
      { name: "知识库/个人知识管理场景", score: 85 },
      { name: "C端用户产品思维", score: 80 },
      { name: "大厂协作/跨团队推进", score: 82 },
      { name: "AI产品经验年限（1-3年）", score: 100 },
    ],
  },

  /** AI 对话里 showJobMatchCard 的结构化展示（与岗位匹配度设计稿一致） */
  jobMatchAliAiNotebookCard: {
    jobTitle: "阿里 AI 笔记 · 产品经理",
    overallScore: 90,
    dimensions: [
      { label: "AI 产品经验年限（1-3年）", percent: 100 },
      { label: "LLM / RAG / Agent 能力理解", percent: 95 },
      { label: "0→1 产品设计经验", percent: 90 },
      { label: "知识库 / 个人知识管理场景", percent: 85 },
      { label: "C 端用户产品思维", percent: 80, weakTag: "待加强" as const },
    ],
    strengthHeading: "最强匹配点",
    strengthBody:
      "设计过 RAG 三层知识库 + fallback 梯度路由，与 AI 笔记的召回架构高度同构；同时是 NotebookLM 重度用户，有第一视角的产品判断。",
    gapHeading: "潜在缺口",
    gapBody:
      "C 端产品经验以工具类为主，消费级习惯养成场景经验相对间接——但 NotebookLM 的使用经历可以作为补充支撑。",
  },

  /** AI 对话里 showSkillsStackCard（与 skills_card 设计稿一致） */
  skillsChatCard: {
    deliveryNote: "不只是「会用」— 实战交付数据",
    delivery: [
      { value: "64", label: "交付应用数" },
      { value: "26", label: "覆盖平台数" },
      { value: "95%", label: "客户满意度" },
    ],
    cta: {
      label: "看 RAG 知识库的具体项目案例",
      /** 千牛对话系统页（RAG / 知识库三层召回） */
      targetPage: "project" as const,
    },
    sections: [
      {
        id: "ai" as const,
        barColor: "#00e5ff",
        title: "AI 产品能力",
        titleColor: "#00e5ff",
        rightBadge: "主攻方向",
        chips: [
          { label: "Prompt 工程", emphasis: true },
          { label: "RAG 知识库", emphasis: true },
          { label: "Agent 工作流", emphasis: true },
          { label: "LLMOps", emphasis: false },
          { label: "意图识别", emphasis: false },
          { label: "对话系统设计", emphasis: false },
          { label: "AB 测试", emphasis: false },
        ],
      },
      {
        id: "lowcode" as const,
        barColor: "#a898ff",
        title: "低代码 / 自动化",
        titleColor: "#a898ff",
        rightBadge: "有证书",
        chips: [
          { label: "飞棋 RPA", emphasis: true },
          { label: "影刀 RPA", emphasis: true },
          { label: "Dify", emphasis: false },
          { label: "扣子 / Coze", emphasis: false },
          { label: "飞书多维表格", emphasis: false },
        ],
      },
      {
        id: "product" as const,
        barColor: "#4aa8a0",
        title: "产品工具链",
        titleColor: "#4aa8a0",
        rightBadge: null as string | null,
        chips: [
          { label: "Axure", emphasis: true },
          { label: "Figma", emphasis: true },
          { label: "JIRA", emphasis: true },
          { label: "Postman", emphasis: true },
          { label: "墨刀", emphasis: true },
          { label: "禅道", emphasis: false },
          { label: "竞品分析", emphasis: false },
        ],
      },
    ],
  },
};

export type ResumeData = typeof RESUME_DATA;
