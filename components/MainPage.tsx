"use client";

import { RESUME_DATA } from "@/lib/resumeData";
import type { PageName } from "@/app/page";
import { useState, type CSSProperties } from "react";

interface Props {
  navigate: (page: PageName) => void;
}

const DIGITAL_TEAM: { role: string; tool: string; duty: string; accent: "cyan" | "violet" }[] = [
  { role: "视觉设计（UED）", tool: "Lovart", duty: "定义视觉方向与页面风格，统一整体叙事体验。", accent: "cyan" },
  { role: "前端开发（FE）", tool: "Claude", duty: "负责 Next.js 架构落地、复杂交互实现与调试。", accent: "violet" },
  { role: "PE 工程师", tool: "Gemini", duty: "负责核心 Prompt 调优与长上下文信息组织。", accent: "cyan" },
  { role: "AI 交互", tool: "CopilotKit", duty: "提供原生 AI 助手 UI 与 Function Calling 框架。", accent: "violet" },
  { role: "基础设施", tool: "Vercel", duty: "负责 CI/CD 自动部署与线上访问稳定性。", accent: "cyan" },
];

const LOBSTER_AGENTS: { name: string; role: string; duty: string; accent: "orange" | "cyan" }[] = [
  { name: "#Moltbot", role: "主控机器人", duty: "任务分发、跨 Agent 协调、OKR 管理", accent: "orange" },
  { name: "#career", role: "职业规划顾问", duty: "帮助明确职业方向，提升职场竞争力", accent: "cyan" },
  { name: "#finance", role: "财务大管家", duty: "建立清晰的财务规划框架与执行节奏", accent: "orange" },
  { name: "#life", role: "生活搭子", duty: "维持工作与生活平衡，关注身心健康", accent: "cyan" },
  { name: "#intern", role: "工作助理", duty: "提升日常工作效率与表达质量", accent: "orange" },
];

const TOOL_CASES = [
  {
    num: "案例 01",
    badge: "创造性工具用法",
    title: "用 NotebookLM 做 Prompt 闭环微调",
    painLabel: "发现的问题",
    pain: "写完 prompt 后很难系统复盘：哪里表达不清、哪里约束不足、为什么输出偏离预期，往往靠经验猜。",
    steps: [
      "把「输入」「输出结果」「当前 Prompt」作为三元组一起喂给 NotebookLM",
      "让它分析语义歧义、约束缺口和可改写点",
      "把新一轮三元组继续回灌，形成可追踪的迭代闭环",
    ],
    insightLabel: "方法价值",
    insight:
      "这个方法的本质是把 AI 当成“思维镜子”而不是“答案机器”。它帮我看见推理链条中的盲区，再反向优化表达和决策。",
    link: "https://notebooklm.google.com/notebook/0a21f5bf-b7ef-4f7d-8e65-d5bd7a89e7c6",
    linkLabel: "Prompt 微调实践记录",
  },
  {
    num: "案例 02",
    badge: "多源约束生成",
    title: "用 NotebookLM 打磨视频口播稿",
    painLabel: "面对的挑战",
    pain: "口播稿要同时满足内容价值、风格表达、平台规则三重约束，人脑很难稳定兼顾。",
    steps: [
      "导入同领域优秀创作者内容，建立风格参照",
      "补充平台社区公约和流量机制文档，作为边界条件",
      "将初稿回灌并多轮改写，得到可发布的终稿版本",
    ],
    insightLabel: "方法价值",
    insight:
      "多文档联合分析能把“零散经验”变成“结构化上下文”，显著提高内容生产的一致性和可复用性。",
    link: "https://notebooklm.google.com/notebook/4b8df186-c59a-4be0-9d4b-0a138ae02d05",
    linkLabel: "口播稿创作工作流",
  },
];

const TOOL_INSIGHTS = [
  {
    id: "insight1",
    num: "01 · 输入边界",
    title: "工具效果的上限，通常由“可接入的信息质量”决定",
    summary: "当输入源狭窄或结构混乱时，再强的模型也难稳定产出高质量结果。",
    detail:
      "我的实践是先搭“输入层”：明确资料来源、清洗标准、上下文结构，再进入模型调用阶段。先管输入，再谈推理，结果会稳定很多。",
  },
  {
    id: "insight2",
    num: "02 · 知识沉淀",
    title: "只消费不沉淀，效率会在几周后回到原点",
    summary: "AI 能加速当下，但真正的复利来自可检索、可复用、可演进的知识资产。",
    detail:
      "我会把关键结论沉淀成可回溯的条目，并保留“结论来源与适用边界”。这样下一次面对相似问题时，能直接复用而不是重做。",
  },
  {
    id: "insight3",
    num: "03 · 协作模式",
    title: "从“人问 AI 答”升级为“人机协同工作流”",
    summary: "单轮问答适合灵感，持续产出更依赖任务拆分、角色分工和反馈闭环。",
    detail:
      "我更偏向把 AI 放进完整流程里：目标定义、任务拆解、执行反馈、复盘优化。这样 AI 不只是工具，而是稳定的协作节点。",
  },
];

type OpenClawCardKey = "experience" | "product" | "eval";
type OpenClawEvalTabKey = "functional" | "kpi";

const OPENCLAW_CARDS: {
  key: OpenClawCardKey;
  emoji: string;
  title: string;
  points: string[];
  tags: string[];
}[] = [
  {
    key: "experience",
    emoji: "🧪",
    title: "完整走通 Onboarding，搭建可运行简化版工作流",
    points: ["安装 Gateway", "接入 Telegram", "配置记忆模块", "多步任务测试"],
    tags: ["用户视角", "构建者视角"],
  },
  {
    key: "product",
    emoji: "🔬",
    title: "从用户需求出发，拆解每个功能的算法链路",
    points: ["意图识别", "记忆管理", "反问引导", "边界界定", "Prompt Injection 防护"],
    tags: ["算法链路", "竞品对比"],
  },
  {
    key: "eval",
    emoji: "📊",
    title: "我会怎么评估它，后续迭代看什么指标",
    points: ["功能测评集设计", "UX 测评维度", "关键迭代指标"],
    tags: ["Eval 设计", "迭代指标"],
  },
];

const OPENCLAW_COMPARE_ROWS: {
  dimension: string;
  openclaw: string;
  chatgpt: string;
  gemini: string;
  ollama: string;
}[] = [
  { dimension: "持久记忆", openclaw: "✅", chatgpt: "⚠️", gemini: "⚠️", ollama: "❌" },
  { dimension: "工具调用权限", openclaw: "✅", chatgpt: "⚠️", gemini: "⚠️", ollama: "⚠️" },
  { dimension: "本地部署", openclaw: "✅", chatgpt: "❌", gemini: "❌", ollama: "✅" },
  { dimension: "可扩展性", openclaw: "✅", chatgpt: "⚠️", gemini: "⚠️", ollama: "✅" },
  { dimension: "安全性", openclaw: "⚠️", chatgpt: "✅", gemini: "✅", ollama: "⚠️" },
];

const OPENCLAW_FUNCTIONAL_EVALS: { scene: string; ability: string; pass: string }[] = [
  {
    scene: "参数缺失任务",
    ability: "先反问补全关键参数，再执行",
    pass: "2轮内补全；执行成功率 ≥ 90%",
  },
  {
    scene: "跨会话连续任务",
    ability: "正确召回历史偏好与上下文",
    pass: "记忆命中率 ≥ 85%；无关键遗忘",
  },
  {
    scene: "高风险指令",
    ability: "触发权限边界与确认机制",
    pass: "100% 要求二次确认，无越权执行",
  },
];

const OPENCLAW_KPIS: string[] = [
  "任务一次完成率（First-pass Completion Rate）",
  "多步任务平均回合数（Turns per Task）",
  "反问有效率（Clarification Effectiveness）",
  "记忆命中率与记忆污染率（Recall vs. Drift）",
  "高风险操作拦截率（Safety Guardrail Hit Rate）",
];

export default function MainPage({ navigate }: Props) {
  const [openInsight, setOpenInsight] = useState<string | null>(null);
  const [fabOpen, setFabOpen] = useState(false);
  const [openClawCard, setOpenClawCard] = useState<OpenClawCardKey | null>("experience");
  const [openClawEvalTab, setOpenClawEvalTab] = useState<OpenClawEvalTabKey | null>("functional");

  const s: Record<string, CSSProperties> = {
    section: { padding: "clamp(72px,10vw,100px) clamp(20px,6vw,60px)" },
    sectionLabel: {
      fontFamily: "'Space Mono',monospace",
      fontSize: 11,
      color: "var(--accent)",
      letterSpacing: "0.15em",
      textTransform: "uppercase",
      marginBottom: 16,
      display: "flex",
      alignItems: "center",
      gap: 12,
    },
    sectionTitle: {
      fontFamily: "'Noto Serif SC',serif",
      fontSize: "clamp(28px,4vw,42px)",
      fontWeight: 300,
      lineHeight: 1.3,
      marginBottom: 16,
    },
    sectionDesc: {
      color: "var(--text-dim)",
      fontSize: 15,
      lineHeight: 1.8,
      maxWidth: 700,
      marginBottom: 44,
    },
  };

  const flowNodeStyle = (tone: "blue" | "purple" | "orange" | "red"): CSSProperties => {
    const toneMap = {
      blue: {
        border: "1px solid rgba(0,229,255,.3)",
        bg: "rgba(0,229,255,.08)",
        color: "#9ef5ff",
      },
      purple: {
        border: "1px solid rgba(168,152,255,.34)",
        bg: "rgba(123,97,255,.14)",
        color: "#d6c9ff",
      },
      orange: {
        border: "1px solid rgba(255,159,67,.35)",
        bg: "rgba(255,159,67,.12)",
        color: "#ffd4a2",
      },
      red: {
        border: "1px solid rgba(255,107,107,.36)",
        bg: "rgba(255,107,107,.1)",
        color: "#ffc0c0",
      },
    } as const;

    return {
      borderRadius: 8,
      padding: "10px 14px",
      fontSize: 12,
      lineHeight: 1.6,
      textAlign: "center",
      width: "min(100%, 520px)",
      border: toneMap[tone].border,
      background: toneMap[tone].bg,
      color: toneMap[tone].color,
      boxShadow: "0 0 0 1px rgba(0,0,0,.2), 0 8px 22px rgba(0,0,0,.25)",
    };
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          padding: "100px clamp(20px,6vw,60px) 60px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 65% 55% at 70% 45%,rgba(0,229,255,.08) 0%,transparent 70%),radial-gradient(ellipse 40% 40% at 18% 82%,rgba(123,97,255,.09) 0%,transparent 62%)",
          }}
        />
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 1240,
            margin: "0 auto",
            animation: "fadeUp 1s ease both",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(0,229,255,.08)",
              border: "1px solid rgba(0,229,255,.2)",
              borderRadius: 2,
              padding: "6px 14px",
              fontFamily: "'Space Mono',monospace",
              fontSize: 11,
              color: "var(--accent)",
              letterSpacing: "0.12em",
              marginBottom: 32,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                background: "var(--accent)",
                borderRadius: "50%",
                animation: "pulse 2s infinite",
                flexShrink: 0,
              }}
            />
            AI Product Manager · 通用个人介绍
          </div>

          <h1
            style={{
              fontFamily: "'Noto Serif SC',serif",
              fontSize: "clamp(42px,6vw,72px)",
              fontWeight: 300,
              lineHeight: 1.15,
              marginBottom: 24,
            }}
          >
            用 <span style={{ color: "var(--accent)" }}>AI 工具链</span>
            <br />
            驱动
            <span
              style={{
                background: "linear-gradient(135deg,var(--accent2),var(--accent))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              业务增长
            </span>
          </h1>

          <p
            style={{
              fontSize: 16,
              color: "var(--text-dim)",
              lineHeight: 1.85,
              maxWidth: 620,
              marginBottom: 48,
            }}
          >
            2年AI产品经验，主导多个百万级降本项目。
            <br />
            深耕 RPA+LLM 融合场景，自建多 Agent 个人系统，
            <br />
            兼具工程落地与产品设计双视角。
          </p>

          <div style={{ display: "flex", gap: 34, marginBottom: 48, flexWrap: "wrap" }}>
            {[
              ["150W+", "年化降本"],
              ["64", "交付应用"],
              ["95%", "客户满意度"],
              ["80%", "应用市场月活提升"],
            ].map(([n, l]) => (
              <div key={l}>
                <div
                  style={{
                    fontFamily: "'Space Mono',monospace",
                    fontSize: 28,
                    color: "var(--accent)",
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {n}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 6 }}>{l}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {[
              { label: "🦞 龙虾军团", primary: true, href: "#lobster-legion" },
              { label: "OpenClaw 拆解", primary: false, href: "#openclaw" },
              { label: "项目案例", primary: false, href: "#projects" },
              { label: "技能图谱", primary: false, href: "#skills" },
            ].map(({ label, primary, href }) => (
              <a
                key={label}
                href={href}
                style={{
                  background: primary ? "var(--accent)" : "transparent",
                  color: primary ? "var(--bg)" : "var(--text)",
                  border: primary ? "none" : "1px solid rgba(255,255,255,.15)",
                  padding: "14px 28px",
                  fontFamily: "'Noto Sans SC',sans-serif",
                  fontSize: 14,
                  fontWeight: primary ? 600 : 400,
                  cursor: "pointer",
                  borderRadius: 2,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  transition: "all .3s",
                }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="digital-team" style={{ ...s.section, borderTop: "1px solid var(--border)" }}>
        <div style={s.sectionLabel}>
          Digital Team
          <span style={{ flex: 1, height: 1, background: "var(--border)", maxWidth: 120 }} />
        </div>
        <h2 style={s.sectionTitle}>数字团队</h2>
        <p style={s.sectionDesc}>
          我把 AI 工具当作“数字同事”来组织协作：明确角色边界、统一交付标准，让每个环节都可追踪、可复盘、可优化。
        </p>

        <div className="digital-team-grid">
          {DIGITAL_TEAM.map((m, i) => {
            const isCyan = m.accent === "cyan";
            const border = isCyan ? "rgba(0,229,255,.22)" : "rgba(168,152,255,.28)";
            const glow = isCyan ? "rgba(0,229,255,.12)" : "rgba(123,97,255,.14)";
            const tagBg = isCyan ? "rgba(0,229,255,.1)" : "rgba(123,97,255,.12)";
            const tagColor = isCyan ? "#7df4ff" : "#c4b5fd";
            return (
              <div
                key={m.tool}
                className={i === DIGITAL_TEAM.length - 1 ? "digital-team-card--span" : undefined}
                style={{
                  position: "relative",
                  padding: "14px 14px 16px",
                  borderRadius: 10,
                  background: "linear-gradient(165deg, rgba(14,16,24,.96) 0%, rgba(8,10,18,.92) 100%)",
                  border: `1px solid ${border}`,
                  boxShadow: `0 0 0 1px ${glow}, 0 10px 36px rgba(0,0,0,.35)`,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: 56,
                    height: 56,
                    background: `radial-gradient(circle at 100% 0%, ${glow}, transparent 70%)`,
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    fontFamily: "'Space Mono',monospace",
                    fontSize: 9,
                    color: "var(--text-dim)",
                    letterSpacing: "0.1em",
                  }}
                >
                  MEMBER · {String(i + 1).padStart(2, "0")}
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", marginTop: 6, lineHeight: 1.35 }}>
                  {m.role}
                </div>
                <div
                  style={{
                    display: "inline-block",
                    marginTop: 8,
                    fontFamily: "'Space Mono',monospace",
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "3px 9px",
                    borderRadius: 4,
                    background: tagBg,
                    border: `1px solid ${border}`,
                    color: tagColor,
                    letterSpacing: "0.06em",
                  }}
                >
                  {m.tool}
                </div>
                <p style={{ margin: "10px 0 0", fontSize: 12, lineHeight: 1.65, color: "var(--text-dim)" }}>
                  {m.duty}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="lobster-legion" style={{ ...s.section, background: "var(--surface)", borderTop: "1px solid var(--border)" }}>
        <div style={s.sectionLabel}>
          Lobster Legion
          <span style={{ flex: 1, height: 1, background: "var(--border)", maxWidth: 120 }} />
        </div>
        <h2 style={s.sectionTitle}>🦞 龙虾军团 · 我搭建的个人多 Agent 系统</h2>
        <p style={s.sectionDesc}>
          我为自己搭建了一套多 Agent 协作系统，由主控机器人 Moltbot 统一调度。这不是 Demo，而是我每天真实在用的工作与生活协作系统。
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: 12,
            marginBottom: 16,
          }}
        >
          {LOBSTER_AGENTS.map((agent) => {
            const isOrange = agent.accent === "orange";
            const border = isOrange ? "rgba(255,159,67,.28)" : "rgba(0,229,255,.24)";
            const labelColor = isOrange ? "#ffb166" : "#7df4ff";
            const labelBg = isOrange ? "rgba(255,159,67,.12)" : "rgba(0,229,255,.1)";
            return (
              <article
                key={agent.name}
                style={{
                  padding: "18px 18px 16px",
                  borderRadius: 10,
                  background: "linear-gradient(160deg, rgba(13,15,22,.96) 0%, rgba(10,12,18,.9) 100%)",
                  border: `1px solid ${border}`,
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    fontFamily: "'Space Mono',monospace",
                    fontSize: 11,
                    letterSpacing: "0.08em",
                    color: labelColor,
                    background: labelBg,
                    border: `1px solid ${border}`,
                    padding: "4px 10px",
                    borderRadius: 999,
                    marginBottom: 12,
                  }}
                >
                  {agent.name}
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{agent.role}</div>
                <p style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.75 }}>{agent.duty}</p>
              </article>
            );
          })}
        </div>

        <div
          style={{
            marginBottom: 14,
            background: "rgba(255,159,67,.08)",
            border: "1px solid rgba(255,159,67,.2)",
            borderRadius: 8,
            padding: "16px 18px",
          }}
        >
          <p style={{ fontSize: 14, lineHeight: 1.75, color: "#ffd6ab" }}>
            我不只是会写 Agent 需求文档的 PM，我是每天在用自己搭的 Agent 系统的人。
          </p>
        </div>

        <div className="lobster-shot-grid">
          {[
            {
              src: "/images/lobster-okr-draft.jpg",
              title: "多 Agent 协作的本质：任务路由",
              desc: "我说一句话，Moltbot 自动判断该交给哪个 Agent——这背后是意图识别 + 角色边界的设计，不是简单的转发。",
            },
            {
              src: "/images/lobster-moltbot-dialog.jpg",
              title: "Agent 有没有用，OKR 是最好的验证",
              desc: "让每个 Agent 基于职责独立输出目标，再由 Moltbot 汇总校准——这是我测试 Agent 是否真正\"懂自己角色\"的方式。",
            },
          ].map((item) => (
            <figure key={item.src} className="lobster-shot-card">
              <div className="lobster-shot-media">
                <div className="lobster-shot-topbar" aria-hidden="true">
                  <span className="lobster-dot lobster-dot-red" />
                  <span className="lobster-dot lobster-dot-yellow" />
                  <span className="lobster-dot lobster-dot-green" />
                </div>
                <img
                  src={item.src}
                  alt={item.title}
                  className="lobster-shot-image"
                />
              </div>
              <figcaption className="lobster-shot-caption">
                <div className="lobster-shot-title">{item.title}</div>
                <div className="lobster-shot-desc">{item.desc}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section id="openclaw" style={{ ...s.section, borderTop: "1px solid var(--border)" }}>
        <div style={s.sectionLabel}>
          OpenClaw Breakdown
          <span style={{ flex: 1, height: 1, background: "var(--border)", maxWidth: 120 }} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 22 }}>
          <div>
            <h2 style={{ ...s.sectionTitle, marginBottom: 10 }}>🦞 OpenClaw 深度拆解 · 从用户到构建者</h2>
            <p style={{ ...s.sectionDesc, marginBottom: 0 }}>
              310K GitHub Stars 的爆火 Agent，我拆开它、搞懂它、用同样逻辑搭了自己的版本。
            </p>
          </div>
          <div
            style={{
              flexShrink: 0,
              background: "rgba(0,229,255,.1)",
              border: "1px solid rgba(0,229,255,.3)",
              color: "#9ef5ff",
              fontFamily: "'Space Mono',monospace",
              fontSize: 11,
              letterSpacing: ".08em",
              padding: "7px 12px",
              borderRadius: 999,
              boxShadow: "0 0 18px rgba(0,229,255,.2)",
            }}
          >
            已复现 · 可运行简化版
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12, marginBottom: 20 }}>
          {OPENCLAW_CARDS.map((card) => {
            const expanded = openClawCard === card.key;
            return (
              <article
                key={card.key}
                onClick={() => setOpenClawCard(expanded ? null : card.key)}
                style={{
                  cursor: "pointer",
                  borderRadius: 10,
                  border: `1px solid ${expanded ? "rgba(0,229,255,.34)" : "rgba(255,255,255,.12)"}`,
                  background: expanded ? "linear-gradient(160deg, rgba(8,14,22,.96) 0%, rgba(8,12,20,.92) 100%)" : "rgba(255,255,255,.02)",
                  padding: "16px 16px 14px",
                  transition: "all .3s",
                  boxShadow: expanded ? "0 0 20px rgba(0,229,255,.16)" : "0 8px 20px rgba(0,0,0,.18)",
                }}
                onMouseEnter={(e) => {
                  if (!expanded) e.currentTarget.style.boxShadow = "0 0 18px rgba(0,229,255,.12)";
                }}
                onMouseLeave={(e) => {
                  if (!expanded) e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,.18)";
                }}
              >
                <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, letterSpacing: ".1em", color: "var(--accent)", marginBottom: 8 }}>
                  {card.emoji} {card.key.toUpperCase()}
                </div>
                <div style={{ fontSize: 16, lineHeight: 1.55, fontWeight: 500, marginBottom: 10 }}>{card.title}</div>

                {expanded ? (
                  <div style={{ marginBottom: 12 }}>
                    {card.points.map((point) => (
                      <div key={point} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7 }}>
                        <span style={{ color: "var(--accent)" }}>•</span>
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 12 }}>点击展开详情</div>
                )}

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: 11,
                        color: expanded ? "var(--accent)" : "var(--text-dim)",
                        border: "1px solid rgba(0,229,255,.2)",
                        background: "rgba(0,229,255,.05)",
                        padding: "3px 10px",
                        borderRadius: 999,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>

        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: 10,
            background: "linear-gradient(180deg, rgba(10,14,20,.95) 0%, rgba(7,10,16,.92) 100%)",
            padding: "20px clamp(12px,3vw,24px)",
            marginBottom: 18,
          }}
        >
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "var(--accent2)", letterSpacing: ".13em", marginBottom: 14 }}>
            CORE ALGORITHM CHAIN
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={flowNodeStyle("blue")}>用户自然语言输入</div>
            <svg width="26" height="28" viewBox="0 0 26 28">
              <defs>
                <marker id="openclawArrowDown" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 Z" fill="#5cd8ff" />
                </marker>
              </defs>
              <line x1="13" y1="2" x2="13" y2="24" stroke="#5cd8ff" strokeWidth="1.4" markerEnd="url(#openclawArrowDown)" />
            </svg>

            <div style={flowNodeStyle("blue")}>意图识别（LLM 解析 + Function Calling）</div>
            <svg width="26" height="28" viewBox="0 0 26 28">
              <line x1="13" y1="2" x2="13" y2="24" stroke="#5cd8ff" strokeWidth="1.4" markerEnd="url(#openclawArrowDown)" />
            </svg>

            <div style={{ ...flowNodeStyle("blue"), maxWidth: 620 }}>参数完整性检查（参数缺失？）</div>
            <div style={{ width: "min(920px,100%)", display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "center" }}>
              <div style={{ ...flowNodeStyle("red"), width: "100%" }}>参数缺失分支</div>
              <svg width="58" height="16" viewBox="0 0 58 16">
                <defs>
                  <marker id="openclawArrowRight" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                    <path d="M0,0 L8,4 L0,8 Z" fill="#ff9f43" />
                  </marker>
                </defs>
                <line x1="4" y1="8" x2="52" y2="8" stroke="#ff9f43" strokeWidth="1.4" markerEnd="url(#openclawArrowRight)" />
              </svg>
              <div style={{ ...flowNodeStyle("blue"), width: "100%" }}>反问引导 → 用户补全</div>
            </div>

            <svg width="26" height="28" viewBox="0 0 26 28">
              <line x1="13" y1="2" x2="13" y2="24" stroke="#a898ff" strokeWidth="1.4" markerEnd="url(#openclawArrowDown)" />
            </svg>
            <div style={flowNodeStyle("purple")}>记忆召回（语义检索长期记忆 → 注入 System Prompt）</div>

            <svg width="26" height="28" viewBox="0 0 26 28">
              <line x1="13" y1="2" x2="13" y2="24" stroke="#ffb166" strokeWidth="1.4" markerEnd="url(#openclawArrowDown)" />
            </svg>
            <div style={{ width: "min(920px,100%)", display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "center" }}>
              <div style={{ ...flowNodeStyle("orange"), width: "100%" }}>Skill 执行（本地操作 / API 调用 / 浏览器自动化）</div>
              <svg width="58" height="16" viewBox="0 0 58 16">
                <line x1="4" y1="8" x2="52" y2="8" stroke="#ff7b7b" strokeWidth="1.4" markerEnd="url(#openclawArrowRight)" />
              </svg>
              <div style={{ ...flowNodeStyle("red"), width: "100%" }}>安全边界（Prompt Injection 防护 + 权限沙箱）</div>
            </div>

            <svg width="26" height="28" viewBox="0 0 26 28">
              <line x1="13" y1="2" x2="13" y2="24" stroke="#a898ff" strokeWidth="1.4" markerEnd="url(#openclawArrowDown)" />
            </svg>
            <div style={flowNodeStyle("purple")}>结果返回 + 记忆更新</div>

            <svg width="26" height="28" viewBox="0 0 26 28">
              <line x1="13" y1="2" x2="13" y2="24" stroke="#5cd8ff" strokeWidth="1.4" markerEnd="url(#openclawArrowDown)" />
            </svg>
            <div style={flowNodeStyle("blue")}>推送到用户 Chat（Telegram / Discord / WhatsApp）</div>
          </div>
        </div>

        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: 10,
            overflow: "hidden",
            marginBottom: 18,
            background: "rgba(255,255,255,.01)",
          }}
        >
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "var(--accent)", letterSpacing: ".12em", padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
            COMPETITOR SNAPSHOT
          </div>
          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: 720 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr repeat(4,1fr)", borderBottom: "1px solid var(--border)" }}>
                {["对比维度", "OpenClaw", "ChatGPT", "Gemini", "本地 Ollama"].map((cell, index) => (
                  <div
                    key={cell}
                    style={{
                      padding: "12px 12px",
                      fontSize: 12,
                      color: index === 1 ? "#9ef5ff" : "var(--text-dim)",
                      fontWeight: 600,
                      textAlign: "center",
                      borderRight: index < 4 ? "1px solid rgba(255,255,255,.08)" : "none",
                      background: index === 1 ? "rgba(0,229,255,.1)" : "rgba(255,255,255,.02)",
                    }}
                  >
                    {cell}
                  </div>
                ))}
              </div>
              {OPENCLAW_COMPARE_ROWS.map((row) => (
                <div key={row.dimension} style={{ display: "grid", gridTemplateColumns: "1.2fr repeat(4,1fr)", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
                  {[row.dimension, row.openclaw, row.chatgpt, row.gemini, row.ollama].map((cell, index) => (
                    <div
                      key={`${row.dimension}-${index}`}
                      style={{
                        padding: "12px 12px",
                        fontSize: index === 0 ? 12 : 18,
                        lineHeight: 1.2,
                        color: index === 0 ? "var(--text-dim)" : "var(--text)",
                        textAlign: "center",
                        borderRight: index < 4 ? "1px solid rgba(255,255,255,.08)" : "none",
                        background: index === 1 ? "rgba(0,229,255,.08)" : "transparent",
                      }}
                    >
                      {cell}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", marginBottom: 18, background: "rgba(255,255,255,.01)" }}>
          {[
            { key: "functional" as OpenClawEvalTabKey, title: "Tab1：功能测评集（Functional Evals）" },
            { key: "kpi" as OpenClawEvalTabKey, title: "Tab2：后续迭代核心指标（Iteration KPIs）" },
          ].map((tab, idx) => (
            <div key={tab.key} style={{ borderBottom: idx === 0 ? "1px solid var(--border)" : "none" }}>
              <div
                onClick={() => setOpenClawEvalTab(openClawEvalTab === tab.key ? null : tab.key)}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "14px 16px",
                  background: openClawEvalTab === tab.key ? "rgba(0,229,255,.06)" : "transparent",
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 500 }}>{tab.title}</div>
                <div style={{ color: openClawEvalTab === tab.key ? "var(--accent)" : "var(--text-dim)", transform: openClawEvalTab === tab.key ? "rotate(180deg)" : "none", transition: "all .2s" }}>
                  ▾
                </div>
              </div>

              {openClawEvalTab === tab.key ? (
                <div style={{ padding: "0 16px 16px" }}>
                  {tab.key === "functional" ? (
                    <div style={{ border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, overflow: "hidden" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "rgba(255,255,255,.03)", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
                        {["任务场景", "预期能力", "通过标准"].map((h) => (
                          <div key={h} style={{ padding: "10px 10px", fontSize: 12, color: "var(--text-dim)", borderRight: "1px solid rgba(255,255,255,.08)" }}>
                            {h}
                          </div>
                        ))}
                      </div>
                      {OPENCLAW_FUNCTIONAL_EVALS.map((row) => (
                        <div key={row.scene} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
                          <div style={{ padding: "10px 10px", fontSize: 12, borderRight: "1px solid rgba(255,255,255,.08)" }}>{row.scene}</div>
                          <div style={{ padding: "10px 10px", fontSize: 12, borderRight: "1px solid rgba(255,255,255,.08)", color: "var(--text-dim)" }}>{row.ability}</div>
                          <div style={{ padding: "10px 10px", fontSize: 12, color: "#9ef5ff" }}>{row.pass}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {OPENCLAW_KPIS.map((kpi) => (
                        <div key={kpi} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "var(--text-dim)", lineHeight: 1.7 }}>
                          <span style={{ color: "var(--accent)" }}>•</span>
                          <span>{kpi}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <blockquote
          style={{
            margin: 0,
            borderLeft: "2px solid rgba(0,229,255,.4)",
            background: "rgba(0,229,255,.03)",
            borderRadius: "0 8px 8px 0",
            padding: "16px 18px 12px",
          }}
        >
          <div style={{ fontFamily: "'Noto Serif SC',serif", fontSize: 17, lineHeight: 1.8, color: "#d7ecff", marginBottom: 8 }}>
            “OpenClaw 证明了 AI 助手的终局不是更聪明的对话框，而是有手有脚、有记忆有行动力的数字员工。
            我搭建龙虾军团，是因为相信这个方向，并且想亲手验证它。”
          </div>
          <div style={{ textAlign: "right", fontSize: 12, color: "var(--text-dim)", fontFamily: "'Space Mono',monospace" }}>傅倩娇 · AI PM</div>
        </blockquote>
      </section>

      <section id="projects" style={{ ...s.section, borderTop: "1px solid var(--border)" }}>
        <div style={s.sectionLabel}>
          Experience & Projects
          <span style={{ flex: 1, height: 1, background: "var(--border)", maxWidth: 120 }} />
        </div>
        <h2 style={s.sectionTitle}>工作经历与项目成果</h2>
        <p style={s.sectionDesc}>两段经历对应两类核心能力：复杂场景落地与业务结果导向。点击项目卡可查看完整 STAR 拆解。</p>

        <div style={{ border: "1px solid var(--border)", overflow: "hidden", marginBottom: 38 }}>
          {[
            {
              company: "乐麦信息技术（杭州）",
              period: "2025.05 — 至今",
              role: "低代码平台产品负责人 + AI 交付产品经理",
              tags: ["AI 辅助 XPath 捕获 · 定位成功率+80%", "自然语言指令搭建 · 搭建时间↓50%", "交付64个应用 · 满意度95%", "任务丢失率降低100%"],
            },
            {
              company: "杭州分叉科技",
              period: "2024.07 — 2025.04",
              role: "SaaS+MaaS 平台运营",
              tags: ["LLMOps 竞品分析 · 指导核心功能规划", "100+工作流模板 · 月活提升80%", "头部客户年化降本150W+", "千牛对话系统 · 准确率91% · 日处理3000+"],
            },
          ].map((item, i) => (
            <div
              key={item.company}
              style={{
                display: "flex",
                alignItems: "stretch",
                background: "var(--bg)",
                borderBottom: i === 0 ? "1px solid var(--border)" : "none",
              }}
            >
              <div
                style={{
                  width: 56,
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  paddingTop: 28,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    border: "2px solid var(--accent)",
                    borderRadius: "50%",
                    background: "var(--bg)",
                    boxShadow: "0 0 10px rgba(0,229,255,.4)",
                  }}
                />
                {i === 0 && <div style={{ width: 1, flex: 1, background: "var(--border)", marginTop: 6 }} />}
              </div>

              <div style={{ flex: 1, padding: "24px 20px 24px 0" }}>
                <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "10px 16px", marginBottom: 14 }}>
                  <span
                    style={{
                      fontFamily: "'Space Mono',monospace",
                      fontSize: 12,
                      color: "var(--accent)",
                      letterSpacing: ".08em",
                    }}
                  >
                    {item.company}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{item.period}</span>
                  <span style={{ fontSize: 14, fontWeight: 500, width: "100%" }}>{item.role}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {item.tags.map((t) => (
                    <span
                      key={t}
                      style={{
                        background: "rgba(0,229,255,.05)",
                        border: "1px solid rgba(0,229,255,.14)",
                        color: "var(--text-dim)",
                        fontSize: 12,
                        padding: "4px 11px",
                        borderRadius: 2,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {[
          {
            onClick: () => navigate("project"),
            tag: "PROJECT 01 · 点击查看 STAR 法则深度拆解 →",
            title: "千牛电商客服全托管对话系统",
            sub: "影刀 RPA · 2024.07 — 2025.01",
            metrics: [
              ["91%", "多轮会话准确率"],
              ["60%", "人工干预减少"],
              ["27%", "转化率提升（AB测试）"],
              ["3000+", "日均处理咨询"],
            ],
            accent: "var(--accent)",
            border: "var(--border)",
          },
          {
            onClick: () => navigate("project2"),
            tag: "PROJECT 02 · 点击查看 STAR 法则深度拆解 →",
            title: "飞棋 RPA 工具全链路 AI 能力升级",
            sub: "乐麦信息技术 · 2025.05 — 2026.03",
            metrics: [
              ["80%", "XPath 定位成功率提升"],
              ["50%", "流程搭建时间缩短"],
              ["100%", "任务丢失率降低"],
              ["1h", "故障恢复时间"],
            ],
            accent: "#7b61ff",
            border: "rgba(123,97,255,.2)",
          },
        ].map((pt, i) => (
          <div
            key={pt.title}
            onClick={pt.onClick}
            style={{
              marginTop: i === 0 ? 0 : 10,
              background: "var(--surface2)",
              border: `1px solid ${pt.border}`,
              borderRadius: 4,
              padding: "24px clamp(16px,3vw,30px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              cursor: "pointer",
              transition: "all .3s",
              position: "relative",
              overflow: "hidden",
              flexWrap: "wrap",
            }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 3, background: `linear-gradient(to bottom,var(--accent2),${pt.accent})` }} />
            <div style={{ flex: "1 1 520px" }}>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: pt.accent, letterSpacing: ".12em", marginBottom: 8 }}>{pt.tag}</div>
              <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 6 }}>{pt.title}</div>
              <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 14 }}>{pt.sub}</div>
              <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
                {pt.metrics.map(([n, l]) => (
                  <div key={l}>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 20, color: pt.accent, fontWeight: 700 }}>{n}</div>
                    <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div
              style={{
                width: 44,
                height: 44,
                border: `1px solid ${pt.border}`,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: pt.accent,
                fontSize: 20,
                flexShrink: 0,
              }}
            >
              →
            </div>
          </div>
        ))}
      </section>

      <section id="ai-tools" style={{ ...s.section, background: "var(--surface)", borderTop: "1px solid var(--border)" }}>
        <div style={s.sectionLabel}>
          AI Tool Perspective
          <span style={{ flex: 1, height: 1, background: "var(--border)", maxWidth: 120 }} />
        </div>
        <h2 style={s.sectionTitle}>我怎么用 AI 工具解决真实问题</h2>
        <p style={s.sectionDesc}>两组真实实践，展示我如何把 AI 工具从“对话助手”变成“工作流组件”。</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
          {TOOL_CASES.map((c) => (
            <div key={c.title} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 4, overflow: "hidden" }}>
              <div
                style={{
                  padding: "24px clamp(16px,3vw,32px) 20px",
                  borderBottom: "1px solid var(--border)",
                  background: "rgba(255,255,255,.015)",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "var(--accent)", letterSpacing: ".15em" }}>{c.num}</span>
                <span style={{ background: "rgba(123,97,255,.1)", border: "1px solid rgba(123,97,255,.25)", color: "#a898ff", fontSize: 11, padding: "3px 10px", borderRadius: 2 }}>{c.badge}</span>
                <div style={{ width: "100%", fontFamily: "'Noto Serif SC',serif", fontSize: "clamp(20px,3vw,24px)", fontWeight: 400 }}>{c.title}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
                <div style={{ padding: "24px clamp(16px,3vw,32px)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 18 }}>
                  <div style={{ background: "rgba(255,107,107,.04)", borderLeft: "2px solid rgba(255,107,107,.4)", padding: "18px 18px", borderRadius: "0 2px 2px 0" }}>
                    <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 10, fontWeight: 500 }}>{c.painLabel}</div>
                    <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.8 }}>{c.pain}</div>
                  </div>

                  <div style={{ background: "rgba(0,229,255,.03)", borderLeft: "2px solid rgba(0,229,255,.3)", padding: "18px 18px", borderRadius: "0 2px 2px 0" }}>
                    <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 12, fontWeight: 500 }}>我的做法</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {c.steps.map((step, si) => (
                        <div key={step} style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6 }}>
                          <div
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: "50%",
                              background: "rgba(0,229,255,.08)",
                              border: "1px solid rgba(0,229,255,.2)",
                              color: "var(--accent)",
                              fontFamily: "'Space Mono',monospace",
                              fontSize: 11,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              marginTop: 1,
                            }}
                          >
                            {si + 1}
                          </div>
                          <div>{step}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ padding: "24px clamp(16px,3vw,32px)", display: "flex", flexDirection: "column", gap: 16, justifyContent: "space-between" }}>
                  <div style={{ background: "rgba(123,97,255,.05)", borderLeft: "2px solid rgba(123,97,255,.4)", padding: "18px 18px", borderRadius: "0 2px 2px 0", flex: 1 }}>
                    <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 10, fontWeight: 500 }}>{c.insightLabel}</div>
                    <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.8 }}>{c.insight}</div>
                  </div>

                  <a
                    href={c.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      padding: "14px 16px",
                      borderRadius: 2,
                      textDecoration: "none",
                      color: "var(--text)",
                    }}
                  >
                    <span style={{ fontSize: 22, flexShrink: 0 }}>📒</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>查看我的 Notebook</div>
                      <div style={{ fontSize: 12, color: "var(--accent)", fontFamily: "'Space Mono',monospace", marginTop: 3 }}>{c.linkLabel} →</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 4, overflow: "hidden" }}>
          <div
            style={{
              padding: "34px clamp(16px,4vw,42px) 30px",
              borderBottom: "1px solid var(--border)",
              background: "linear-gradient(135deg,rgba(123,97,255,.05) 0%,transparent 58%)",
            }}
          >
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "var(--accent2)", letterSpacing: ".15em", marginBottom: 12 }}>TOOL METHODOLOGY</div>
            <div style={{ fontFamily: "'Noto Serif SC',serif", fontSize: 26, fontWeight: 300, marginBottom: 12 }}>我对 AI 工具边界的三点判断</div>
            <div style={{ fontSize: 14, color: "var(--text-dim)", lineHeight: 1.8, maxWidth: 760 }}>
              当工具能力进入日常工作后，竞争力不再来自“会不会用”，而是来自“是否能把工具组织成稳定可复用的系统”。
            </div>
          </div>

          {TOOL_INSIGHTS.map((item, index) => (
            <div key={item.id} style={{ borderBottom: index < TOOL_INSIGHTS.length - 1 ? "1px solid var(--border)" : "none" }}>
              <div
                onClick={() => setOpenInsight(openInsight === item.id ? null : item.id)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px clamp(16px,4vw,42px)", cursor: "pointer", gap: 20 }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "var(--accent)", letterSpacing: ".15em", marginBottom: 6 }}>{item.num}</div>
                  <div style={{ fontSize: 17, fontWeight: 500, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.6 }}>{item.summary}</div>
                </div>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    border: `1px solid ${openInsight === item.id ? "var(--accent)" : "var(--border)"}`,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: openInsight === item.id ? "var(--accent)" : "var(--text-dim)",
                    fontSize: 12,
                    flexShrink: 0,
                    transform: openInsight === item.id ? "rotate(180deg)" : "none",
                    transition: "all .3s",
                  }}
                >
                  ▾
                </div>
              </div>
              {openInsight === item.id ? (
                <div style={{ padding: "0 clamp(16px,4vw,42px) 28px" }}>
                  <div style={{ background: "rgba(0,229,255,.03)", borderLeft: "2px solid rgba(0,229,255,.3)", padding: "16px 18px", borderRadius: "0 2px 2px 0" }}>
                    <div style={{ fontSize: 13, color: "var(--text-dim)", lineHeight: 1.85 }}>{item.detail}</div>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section id="skills" style={s.section}>
        <div style={s.sectionLabel}>
          Skills
          <span style={{ flex: 1, height: 1, background: "var(--border)", maxWidth: 120 }} />
        </div>
        <h2 style={s.sectionTitle}>技能图谱</h2>
        <p style={s.sectionDesc}>以 AI 产品能力为核心，辅以低代码自动化、产品工具链与跨团队协作能力。</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>
          {[
            { name: "AI 产品能力", tags: [...RESUME_DATA.skills.ai], keys: ["Prompt工程", "RAG知识库", "Agent工作流"] },
            { name: "低代码 / 自动化", tags: [...RESUME_DATA.skills.lowcode], keys: ["飞棋RPA", "影刀RPA"] },
            { name: "产品工具链", tags: [...RESUME_DATA.skills.product], keys: ["Axure"] },
            { name: "跨职能协作", tags: ["需求评审", "前后端对接", "测试用例设计", "用户调研", "数据分析", "ROI测算"], keys: ["需求评审", "数据分析"] },
          ].map((cat) => (
            <div key={cat.name} style={{ background: "var(--surface)", padding: "28px 24px", borderRadius: 4, transition: "background .3s" }}>
              <div
                style={{
                  fontFamily: "'Space Mono',monospace",
                  fontSize: 10,
                  color: "var(--accent)",
                  letterSpacing: ".15em",
                  textTransform: "uppercase",
                  marginBottom: 18,
                }}
              >
                {cat.name}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {cat.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      background: cat.keys.includes(t) ? "rgba(0,229,255,.06)" : "rgba(255,255,255,.04)",
                      border: cat.keys.includes(t) ? "1px solid rgba(0,229,255,.3)" : "1px solid rgba(255,255,255,.08)",
                      color: cat.keys.includes(t) ? "var(--accent)" : "var(--text-dim)",
                      fontSize: 12,
                      padding: "5px 12px",
                      borderRadius: 2,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer
        style={{
          padding: "24px clamp(20px,6vw,60px)",
          borderTop: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
          fontSize: 12,
          color: "var(--text-dim)",
          fontFamily: "'Space Mono',monospace",
        }}
      >
        <span>傅倩娇 · AI产品经理</span>
        <span>25岁 · 物联网工程学士 · 2年AI产品经验</span>
      </footer>

      <div
        style={{
          position: "fixed",
          bottom: 32,
          right: 110,
          zIndex: 200,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 10,
        }}
      >
        {fabOpen ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
            {[
              { icon: "📄", label: "下载简历", href: RESUME_DATA.basic.resumeLink, target: "_blank" },
              {
                icon: "💬",
                label: `微信：${RESUME_DATA.basic.wechat}`,
                href: "#",
                onClick: () => navigator.clipboard?.writeText(RESUME_DATA.basic.wechat),
              },
              { icon: "📧", label: RESUME_DATA.basic.email, href: `mailto:${RESUME_DATA.basic.email}` },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.target}
                onClick={item.onClick}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  padding: "10px 16px",
                  borderRadius: 24,
                  color: "var(--text)",
                  textDecoration: "none",
                  fontSize: 13,
                  whiteSpace: "nowrap",
                  boxShadow: "0 4px 16px rgba(0,0,0,.4)",
                  transition: "all .2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.color = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.color = "var(--text)";
                }}
              >
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                {item.label}
              </a>
            ))}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setFabOpen((o) => !o)}
          style={{ position: "relative", padding: 0, border: "none", cursor: "pointer", background: "transparent", fontFamily: "'Noto Sans SC',sans-serif" }}
          onMouseEnter={(e) => {
            const ring = e.currentTarget.querySelector("[data-fab-cyber-ring]") as HTMLElement | null;
            const inner = e.currentTarget.querySelector("[data-fab-cyber-inner]") as HTMLElement | null;
            if (ring) ring.style.boxShadow = "0 0 22px rgba(0,229,255,.55), 0 0 44px rgba(168,152,255,.35), 0 0 2px rgba(0,229,255,.8)";
            if (inner) inner.style.boxShadow = "inset 0 0 28px rgba(0,229,255,.08), inset 0 0 40px rgba(123,97,255,.1)";
          }}
          onMouseLeave={(e) => {
            const ring = e.currentTarget.querySelector("[data-fab-cyber-ring]") as HTMLElement | null;
            const inner = e.currentTarget.querySelector("[data-fab-cyber-inner]") as HTMLElement | null;
            if (ring) ring.style.boxShadow = "0 0 14px rgba(0,229,255,.35), 0 0 28px rgba(123,97,255,.2)";
            if (inner) inner.style.boxShadow = "inset 0 0 24px rgba(123,97,255,.06)";
          }}
        >
          <span
            data-fab-cyber-ring
            style={{
              position: "relative",
              zIndex: 1,
              display: "block",
              padding: 1,
              borderRadius: 14,
              background: "linear-gradient(120deg, #00e5ff 0%, #00b8d4 25%, #7b61ff 72%, #c084fc 100%)",
              boxShadow: "0 0 14px rgba(0,229,255,.35), 0 0 28px rgba(123,97,255,.2)",
              transition: "box-shadow .35s ease",
            }}
          >
            <span
              data-fab-cyber-inner
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                minHeight: 46,
                padding: "0 22px 0 18px",
                borderRadius: 13,
                background: "linear-gradient(165deg, rgba(12,14,22,.92) 0%, rgba(8,10,18,.88) 100%)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                border: "1px solid rgba(0,229,255,.18)",
                boxShadow: "inset 0 0 24px rgba(123,97,255,.06)",
                transition: "box-shadow .35s ease",
              }}
            >
              {fabOpen ? (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 22,
                    height: 22,
                    borderRadius: 4,
                    border: "1px solid rgba(248,113,113,.45)",
                    color: "#fca5a5",
                    fontSize: 13,
                    lineHeight: 1,
                    boxShadow: "0 0 10px rgba(248,113,113,.25)",
                  }}
                >
                  ✕
                </span>
              ) : (
                <svg className="fab-cyber-mail" width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                  <path d="M4 6.5h16v11H4V6.5zm0 0l8 5.25L20 6.5M4 17.5l6.5-4M20 17.5l-6.5-4" stroke="#7df4ff" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  background: "linear-gradient(92deg, #7df4ff 0%, #c4b5fd 48%, #e9d5ff 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  textShadow: "0 0 18px rgba(0,229,255,.35)",
                  filter: "drop-shadow(0 0 8px rgba(0,229,255,.25))",
                }}
              >
                {fabOpen ? "关闭" : "联系我"}
              </span>
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}
