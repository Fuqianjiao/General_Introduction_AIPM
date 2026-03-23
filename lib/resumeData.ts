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
      tagline: "连接器和MCP本质是同一问题——知识入口太窄，洞察也无法变成行动",
      gap: "目前信息来源仅限手动上传，NotebookLM是封闭的知识消费系统，无法执行动作",
      suggestion: "① 参考Claude 100+连接器体系支持主流SaaS直连；② 接入MCP协议让知识驱动行动，如读完会议纪要→自动创建Jira任务",
    },
    {
      id: "knowledge",
      title: "补足知识管理能力，而不只是知识消费",
      tagline: "资料坟场问题仅解决了消化环节，未解决积累环节",
      gap: "无双向链接、图谱化展示、分层管理，资料只能按笔记本简单分类",
      suggestion: "① 双向链接+知识图谱；② 分层标签体系；③ 知识健康度提示（过时/缺失关联）",
    },
    {
      id: "interaction",
      title: "从被动问答走向主动洞察与个性化适配",
      tagline: "习惯养成的本质是让用户感到这个AI越来越懂我",
      gap: "仍以用户提问→AI回答的被动模式为主，无法主动推送未关联知识点，也无法记忆使用偏好",
      suggestion: "① 主动知识推送（检测关联/矛盾）；② 用户画像+个性化记忆跨会话保持",
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
};

export type ResumeData = typeof RESUME_DATA;
