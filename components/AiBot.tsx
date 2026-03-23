"use client";
// components/AiBot.tsx — 对话框结构与设计稿 ai_bot_design_spec.html 对齐
import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  useCopilotReadable,
  useCopilotAction,
  useCopilotChat,
} from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import { TextMessage, MessageRole } from "@copilotkit/runtime-client-gql";
import { RESUME_DATA } from "@/lib/resumeData";
import type { PageName } from "@/app/page";
import { useSiliconflowUserKeyOptional } from "@/components/CopilotProviders";
import {
  loadChatMemory,
  mergeMemoryFromMessages,
  messageToSnippet,
  saveChatMemory,
  type StoredChatMemory,
} from "@/lib/copilotLocalMemory";

interface Props {
  navigate: (page: PageName) => void;
  currentPage: PageName;
}

/** ② 快捷问题 — 文案与设计稿一致；技术类=青 / 联系=紫 */
const QUICK_ACTIONS: { label: string; q: string; variant: "tech" | "contact" }[] = [
  { label: "核心项目", q: "她有哪些核心项目经历？", variant: "tech" },
  { label: "AI笔记看法", q: "她对 AI 笔记产品有什么洞察？", variant: "tech" },
  { label: "岗位匹配度", q: "她与阿里 AI 笔记岗位的匹配度如何？", variant: "tech" },
  { label: "联系她", q: "怎么联系傅倩娇？", variant: "contact" },
];

function quickChipStyle(variant: "tech" | "contact", hover: boolean): CSSProperties {
  if (variant === "contact") {
    return {
      background: hover ? "rgba(123,97,255,0.12)" : "rgba(123,97,255,0.1)",
      border: `1px solid ${hover ? "rgba(168,152,255,0.4)" : "rgba(123,97,255,0.25)"}`,
      color: hover ? "#d4c8ff" : "#a898ff",
    };
  }
  return {
    background: hover ? "rgba(0,229,255,0.1)" : "rgba(0,229,255,0.07)",
    border: `1px solid ${hover ? "rgba(0,229,255,0.35)" : "rgba(0,229,255,0.18)"}`,
    color: hover ? "#9ef5ff" : "#7fe8f5",
  };
}

/** Function Calling 进行中：橙色状态条（无设计稿标注文案） */
function FcSection({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <div
      style={{
        padding: "10px 14px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          background: "rgba(240,160,64,0.06)",
          border: "1px solid rgba(240,160,64,0.15)",
          padding: "7px 10px",
          borderRadius: 6,
        }}
      >
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#f0a040",
            flexShrink: 0,
            animation: "fcBlink 0.6s ease-in-out infinite alternate",
          }}
        />
        <span
          style={{
            fontSize: 11,
            color: "#f0a040",
            letterSpacing: "0.06em",
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
}

/** 欢迎语 + 身份锚定 */
function WelcomeAnchor() {
  return (
    <div
      style={{
        padding: "12px 14px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 8,
          padding: "10px 12px",
          fontSize: 12,
          color: "#c8cacc",
          lineHeight: 1.6,
        }}
      >
        你好！我是傅倩娇的 AI 助手。
        <br />
        <span style={{ color: "#a898ff" }}>
          你是想了解她的项目经历、技术能力，还是直接看她对 AI 笔记的产品看法？
        </span>
      </div>
    </div>
  );
}

// ── Orb Canvas (plasma animation) ───────────────────────────────
function OrbCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 64;
    canvas.height = 64;
    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, 64, 64);
      const cx = 32,
        cy = 32;
      for (let i = 0; i < 3; i++) {
        const phase = t + i * 2.1;
        const x1 = cx + Math.cos(phase) * 18;
        const y1 = cy + Math.sin(phase) * 12;
        const x2 = cx + Math.cos(phase + Math.PI) * 18;
        const y2 = cy + Math.sin(phase + Math.PI) * 12;
        const g = ctx.createLinearGradient(x1, y1, x2, y2);
        const colors = [
          ["rgba(0,229,255,", "rgba(123,97,255,"],
          ["rgba(180,100,255,", "rgba(0,200,255,"],
          ["rgba(100,150,255,", "rgba(200,80,255,"],
        ];
        g.addColorStop(0, colors[i][0] + "0.8)");
        g.addColorStop(1, colors[i][1] + "0.4)");
        ctx.beginPath();
        ctx.ellipse(cx, cy, 18 + i * 3, 10 + i * 2, phase, 0, Math.PI * 2);
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      t += 0.025;
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        borderRadius: "50%",
      }}
    />
  );
}

function pageNavLabel(page: string | undefined): string {
  if (page === "main") return "主页";
  if (page === "project") return "千牛项目的 STAR 详解";
  if (page === "project2") return "飞棋项目的 STAR 详解";
  return "目标页面";
}

const NOTEBOOK_POINT_LABELS = ["一", "二", "三"] as const;

type NotebookInternalLink = { label: string; page: PageName; hash?: string };

function collectUniqueNotebookInternalLinks(): NotebookInternalLink[] {
  const seen = new Set<string>();
  const out: NotebookInternalLink[] = [];
  for (const op of RESUME_DATA.aiNotebookOpinions) {
    const raw =
      "relatedLinks" in op && Array.isArray(op.relatedLinks) ? op.relatedLinks : [];
    for (const l of raw) {
      if (l.kind !== "internal") continue;
      const key = `${l.page}:${l.hash ?? ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ label: l.label, page: l.page as PageName, hash: l.hash });
    }
  }
  return out;
}

function NotebookInternalLinkButtons({
  links,
  navigate,
  setOpen,
}: {
  links: NotebookInternalLink[];
  navigate: (p: PageName) => void;
  setOpen: (v: boolean) => void;
}) {
  if (!links.length) return null;
  return (
    <div style={{ marginTop: 6 }}>
      <div
        style={{
          fontSize: 9,
          color: "rgba(255,255,255,0.35)",
          letterSpacing: "0.08em",
          marginBottom: 5,
        }}
      >
        站内跳转
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {links.map((link, i) => (
          <button
            key={`${link.page}-${link.hash ?? i}`}
            type="button"
            onClick={() => {
              navigate(link.page);
              const h = link.hash?.replace(/^#/, "");
              if (h) {
                window.setTimeout(() => {
                  document.getElementById(h)?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }, 150);
              }
              setOpen(false);
            }}
            style={{
              fontSize: 10,
              color: "#c4b5fd",
              textAlign: "left",
              cursor: "pointer",
              padding: "5px 8px",
              borderRadius: 4,
              border: "1px solid rgba(168,152,255,0.25)",
              background: "rgba(123,97,255,0.08)",
              fontFamily: "'Noto Sans SC',sans-serif",
            }}
          >
            {link.label} →
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main AiBot Component ─────────────────────────────────────────
export default function AiBot({ navigate, currentPage }: Props) {
  const [open, setOpen] = useState(false);
  const [fcText, setFcText] = useState<string | null>(null);
  const [status, setStatus] = useState<"ready" | "thinking" | "error">("ready");
  const [keyPanelOpen, setKeyPanelOpen] = useState(false);
  const [keyDraft, setKeyDraft] = useState("");
  const siliconflowCtx = useSiliconflowUserKeyOptional();
  const { appendMessage, visibleMessages } = useCopilotChat();
  const [chatMemory, setChatMemory] = useState<StoredChatMemory>(() => loadChatMemory());
  const memorySyncSig = useRef("");

  useCopilotReadable({
    description: "傅倩娇的完整简历信息、工作经历、项目经历和技能",
    value: RESUME_DATA,
  });

  useCopilotReadable({
    description: "当前用户正在查看的页面",
    value: {
      currentPage,
      pageDescription:
        currentPage === "main"
          ? "主页"
          : currentPage === "project"
            ? "千牛客服项目STAR详解"
            : "飞棋RPA项目STAR详解",
    },
  });

  useCopilotReadable({
    description:
      "本地持久化对话记忆（用户刷新页面后仍保留）：recent 为最近最多 3 条 user/assistant 文本摘要；longTerm 为随时间滚动的长期摘要。请结合当前问题、简历事实与该记忆作答，避免自相矛盾。",
    value: chatMemory,
  });

  useEffect(() => {
    if (!visibleMessages?.length) return;
    const last = visibleMessages[visibleMessages.length - 1] as {
      id?: string;
      role?: string;
      content?: string;
    };
    const sig = `${visibleMessages.length}:${last?.id ?? ""}:${String(last?.content ?? "").slice(0, 160)}`;
    if (sig === memorySyncSig.current) return;
    memorySyncSig.current = sig;
    const snippets = visibleMessages
      .map((m) => messageToSnippet(m as { role?: string; content?: string }))
      .filter((x): x is { role: string; text: string } => Boolean(x));
    if (!snippets.length) return;
    const base = loadChatMemory();
    const merged: StoredChatMemory =
      last.role === "assistant"
        ? mergeMemoryFromMessages(base, snippets)
        : {
            ...base,
            recent: snippets.slice(-3),
            updatedAt: new Date().toISOString(),
          };
    saveChatMemory(merged);
    setChatMemory(merged);
  }, [visibleMessages]);

  useCopilotAction({
    name: "navigateToPage",
    description: "跳转到网站的指定页面。当用户想看某个项目详情、或想回到主页时调用。",
    parameters: [
      {
        name: "page",
        type: "string",
        description: "目标页面：'main'=主页, 'project'=千牛对话系统项目, 'project2'=飞棋RPA项目",
        enum: ["main", "project", "project2"],
        required: true,
      },
    ],
    render: ({ status: rs, args }) => {
      const dest = pageNavLabel(args.page);
      const loading = rs === "executing" || rs === "inProgress";
      return (
        <div style={{ margin: "4px 0" }}>
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 8,
              padding: "9px 11px",
              fontSize: 11,
              color: "#c8cacc",
              lineHeight: 1.6,
            }}
          >
            {loading ? `我来带你看${dest} →` : `已为你打开${dest}。`}
            {loading && (
              <div
                style={{
                  marginTop: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "rgba(0,229,255,0.06)",
                  border: "1px solid rgba(0,229,255,0.15)",
                  padding: "5px 9px",
                  borderRadius: 4,
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#00e5ff",
                    flexShrink: 0,
                    animation: "fcBlink 0.8s ease-in-out infinite alternate",
                  }}
                />
                <span style={{ fontSize: 10, color: "#00e5ff" }}>正在跳转页面...</span>
              </div>
            )}
          </div>
        </div>
      );
    },
    handler: async ({ page }) => {
      setFcText("正在跳转页面...");
      await new Promise((r) => setTimeout(r, 550));
      navigate(page as PageName);
      setFcText(null);
      return `已为你打开${pageNavLabel(page)}。聊天窗仍保持打开，你可继续追问；若需专心阅读页面可自行点 ✕ 收起。`;
    },
  });

  useCopilotAction({
    name: "showProjectHighlights",
    description: "展示某个项目的核心亮点和数据指标。当用户询问项目细节时调用。",
    parameters: [
      {
        name: "projectId",
        type: "string",
        description: "项目ID：'qianniu'=千牛对话系统, 'feiqí'=飞棋RPA",
        enum: ["qianniu", "feiqí"],
        required: true,
      },
    ],
    render: ({ status: actionStatus, args }) => {
      const project = RESUME_DATA.projects.find((p) => p.id === args.projectId);
      if (!project) return null;
      const metrics = Object.values(project.metrics);
      const starPage: PageName = project.id === "qianniu" ? "project" : "project2";
      return (
        <div style={{ margin: "4px 0" }}>
          <div
            style={{
              background: "rgba(0,229,255,0.04)",
              border: "1px solid rgba(0,229,255,0.15)",
              borderRadius: 7,
              padding: "9px 11px",
            }}
          >
            <div
              style={{
                fontSize: 9,
                color: "#00e5ff",
                letterSpacing: "0.1em",
                marginBottom: 6,
              }}
            >
              {actionStatus === "executing" || actionStatus === "inProgress"
                ? "◆ 加载中…"
                : "◆ 项目亮点"}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#e8eaf0",
                fontWeight: 500,
                marginBottom: 7,
                lineHeight: 1.35,
              }}
            >
              {project.name}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
              {metrics.map((m, i) => (
                <span
                  key={i}
                  style={{
                    background: "rgba(123,97,255,0.12)",
                    border: "1px solid rgba(123,97,255,0.25)",
                    color: "#a898ff",
                    fontSize: 10,
                    padding: "2px 7px",
                    borderRadius: 3,
                    lineHeight: 1.3,
                  }}
                >
                  {m}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                navigate(starPage);
                setOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                cursor: "pointer",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 4,
                padding: "6px 9px",
                fontFamily: "'Noto Sans SC',sans-serif",
              }}
            >
              <span style={{ fontSize: 10, color: "#7a8090" }}>查看完整 STAR 拆解</span>
              <span style={{ fontSize: 12, color: "#00e5ff" }}>→</span>
            </button>
          </div>
        </div>
      );
    },
    handler: async ({ projectId }) => {
      setFcText("正在检索项目数据库...");
      await new Promise((r) => setTimeout(r, 800));
      setFcText(null);
      const p = RESUME_DATA.projects.find((p) => p.id === projectId);
      return p ? `已加载${p.name}的项目数据` : "项目未找到";
    },
  });

  useCopilotAction({
    name: "showAiNotebookOpinionsAll",
    description:
      "在一张「AI 笔记洞察」卡片内并列展示第一点、第二点、第三点（资源边界 / 知识管理 / 交互模式）。当用户泛泛地问「AI笔记看法」「有哪些洞察」「NotebookLM」「整体观点」且未指定只谈某一条时，必须优先调用本工具（无参数），不要只调用 showAiNotebookOpinion 单条。",
    parameters: [],
    render: ({ status: actionStatus }) => {
      const busy = actionStatus === "executing" || actionStatus === "inProgress";
      const allLinks = collectUniqueNotebookInternalLinks();
      const ops = RESUME_DATA.aiNotebookOpinions;
      return (
        <div style={{ margin: "4px 0" }}>
          <div
            style={{
              background: "rgba(0,229,255,0.04)",
              border: "1px solid rgba(0,229,255,0.15)",
              borderRadius: 7,
              padding: "9px 11px",
            }}
          >
            <div
              style={{
                fontSize: 9,
                color: "#00e5ff",
                letterSpacing: "0.1em",
                marginBottom: 8,
              }}
            >
              {busy ? "◆ 加载中…" : "◆ AI 笔记洞察"}
            </div>
            {ops.map((op, idx) => (
              <div
                key={op.id}
                style={{
                  marginBottom: idx === ops.length - 1 ? 6 : 12,
                  paddingBottom: idx === ops.length - 1 ? 0 : 10,
                  borderBottom:
                    idx === ops.length - 1 ? "none" : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 11,
                    color: "#e8eaf0",
                    marginBottom: 4,
                    lineHeight: 1.35,
                  }}
                >
                  第{NOTEBOOK_POINT_LABELS[idx]}点 · {op.title}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#a8adb8",
                    lineHeight: 1.45,
                    marginBottom: 5,
                  }}
                >
                  {op.tagline}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    background: "rgba(255,107,107,0.07)",
                    borderLeft: "2px solid rgba(255,107,107,0.45)",
                    padding: "5px 7px",
                    marginBottom: 4,
                    color: "#b8bcc4",
                    lineHeight: 1.5,
                  }}
                >
                  <span style={{ color: "#ff9090", letterSpacing: "0.06em" }}>缺口 </span>
                  {op.gap}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    background: "rgba(0,229,255,0.06)",
                    borderLeft: "2px solid rgba(0,229,255,0.35)",
                    padding: "5px 7px",
                    color: "#b8bcc4",
                    lineHeight: 1.5,
                  }}
                >
                  <span style={{ color: "#00e5ff", letterSpacing: "0.06em" }}>建议 </span>
                  {op.suggestion}
                </div>
              </div>
            ))}
            <NotebookInternalLinkButtons links={allLinks} navigate={navigate} setOpen={setOpen} />
          </div>
        </div>
      );
    },
    handler: async () => {
      setFcText("正在汇总 AI 笔记三点洞察...");
      await new Promise((r) => setTimeout(r, 600));
      setFcText(null);
      return "单卡已含第一点、第二点、第三点。后续回复禁止复述卡片正文；允许≤15字承接（如「想展开哪一点？」）或结束。";
    },
  });

  useCopilotAction({
    name: "showAiNotebookOpinion",
    description:
      "仅展示一条洞察。仅当用户明确只要其中某一角度（如只谈连接器/MCP、只谈知识图谱/双向链接、只谈主动推送/个性化）时调用，并选对 opinionId。泛泛总览不要用本工具，改用 showAiNotebookOpinionsAll。",
    parameters: [
      {
        name: "opinionId",
        type: "string",
        description: "洞察ID：'resource'=资源边界, 'knowledge'=知识管理, 'interaction'=交互模式",
        enum: ["resource", "knowledge", "interaction"],
        required: true,
      },
    ],
    render: ({ status: actionStatus, args }) => {
      const op = RESUME_DATA.aiNotebookOpinions.find((o) => o.id === args.opinionId);
      if (!op) return null;
      const linksRaw = "relatedLinks" in op && Array.isArray(op.relatedLinks) ? op.relatedLinks : [];
      const links = linksRaw.filter((l) => l.kind === "internal");
      return (
        <div style={{ margin: "4px 0" }}>
          <div
            style={{
              background: "rgba(0,229,255,0.04)",
              border: "1px solid rgba(0,229,255,0.15)",
              borderRadius: 7,
              padding: "9px 11px",
            }}
          >
            <div
              style={{
                fontSize: 9,
                color: "#00e5ff",
                letterSpacing: "0.1em",
                marginBottom: 6,
              }}
            >
              {actionStatus === "executing" || actionStatus === "inProgress"
                ? "◆ 加载中…"
                : "◆ AI 笔记洞察"}
            </div>
            <div
              style={{
                fontWeight: 500,
                fontSize: 11,
                color: "#e8eaf0",
                marginBottom: 4,
                lineHeight: 1.35,
              }}
            >
              {op.title}
            </div>
            <div style={{ fontSize: 11, color: "#c8cacc", lineHeight: 1.5, marginBottom: 6 }}>{op.tagline}</div>
            <div
              style={{
                fontSize: 10,
                background: "rgba(255,107,107,0.07)",
                borderLeft: "2px solid rgba(255,107,107,0.45)",
                padding: "5px 7px",
                marginBottom: 5,
                color: "#b8bcc4",
                lineHeight: 1.5,
              }}
            >
              <span
                style={{
                  color: "#ff9090",
                  letterSpacing: "0.06em",
                }}
              >
                缺口{" "}
              </span>
              {op.gap}
            </div>
            <div
              style={{
                fontSize: 10,
                background: "rgba(0,229,255,0.06)",
                borderLeft: "2px solid rgba(0,229,255,0.35)",
                padding: "5px 7px",
                marginBottom: 8,
                color: "#b8bcc4",
                lineHeight: 1.5,
              }}
            >
              <span style={{ color: "#00e5ff", letterSpacing: "0.06em" }}>建议 </span>
              {op.suggestion}
            </div>
            <NotebookInternalLinkButtons
              links={links.map((l) => ({
                label: l.label,
                page: l.page as PageName,
                hash: l.hash,
              }))}
              navigate={navigate}
              setOpen={setOpen}
            />
          </div>
        </div>
      );
    },
    handler: async ({ opinionId }) => {
      setFcText("正在检索产品洞察库...");
      await new Promise((r) => setTimeout(r, 700));
      setFcText(null);
      const op = RESUME_DATA.aiNotebookOpinions.find((o) => o.id === opinionId);
      return op
        ? `已展示单条「${op.title}」。禁止在正文中重复卡片里的缺口与建议；最多一句短承接。`
        : "未找到对应洞察";
    },
  });

  useCopilotAction({
    name: "getContactInfo",
    description: "获取傅倩娇的联系方式。当用户询问如何联系、微信、邮箱时调用。",
    parameters: [],
    render: ({ status: actionStatus }) => (
      <div style={{ margin: "4px 0" }}>
        <div
          style={{
            background: "rgba(123,97,255,0.08)",
            border: "1px solid rgba(168,152,255,0.22)",
            borderRadius: 7,
            padding: "9px 11px",
          }}
        >
          <div
            style={{
              fontSize: 9,
              color: "#a898ff",
              letterSpacing: "0.12em",
              marginBottom: 6,
            }}
          >
            {actionStatus === "executing" || actionStatus === "inProgress" ? "⟳ 获取中…" : "联系方式"}
          </div>
          {[
            { icon: "💬", label: "微信", value: RESUME_DATA.basic.wechat },
            { icon: "📧", label: "邮箱", value: RESUME_DATA.basic.email },
            { icon: "📄", label: "简历", value: "点击下载", href: RESUME_DATA.basic.resumeLink },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
              <span style={{ fontSize: 12 }}>{item.icon}</span>
              <span style={{ fontSize: 9, color: "#7a8090", width: 28 }}>{item.label}</span>
              {item.href ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 11, color: "#a898ff", textDecoration: "none" }}
                >
                  {item.value} →
                </a>
              ) : (
                <span style={{ fontSize: 11, color: "#e8eaf0" }}>{item.value}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    ),
    handler: async () => {
      setFcText("正在获取联系方式...");
      await new Promise((r) => setTimeout(r, 500));
      setFcText(null);
      return `联系方式：微信${RESUME_DATA.basic.wechat}，邮箱${RESUME_DATA.basic.email}`;
    },
  });

  const statusLine =
    status === "ready"
      ? "● 就绪"
      : status === "thinking"
        ? "● 思考中..."
        : "● 错误";

  const statusColor = status === "ready" ? "#00e5ff" : status === "thinking" ? "#f0a040" : "#ff6b6b";

  /** 走 CopilotKit 官方 API；勿改 DOM：输入框是受控组件，伪造 input/submit 不会更新 React state，也不会触发发送 */
  const submitCopilotQuestion = (q: string) => {
    void (async () => {
      try {
        await appendMessage(
          new TextMessage({
            role: MessageRole.User,
            content: q,
          }),
        );
      } catch (e) {
        console.error("快捷问题发送失败:", e);
        setStatus("error");
      }
    })();
  };

  const botInstructions = `你是傅倩娇的专属 AI 助手，面向面试官。

【引导逻辑 — 必须遵守】
1) 分流：用户开口后先用一句话对齐意图：项目/技术、AI 笔记观点、岗位匹配，还是联系方式；不要重复朗读整段欢迎语。
2) 用户可用顶部快捷按钮发起问题；若已发起，直接执行对应能力，少废话。
3) 调用 function 时，用户会在上方看到橙色「正在检索…」状态条；正文保持简洁。
4) 结构化优先：问项目、指标、STAR 时必须先 showProjectHighlights 出卡片（指标 badge + STAR 按钮），禁止只用长文字堆砌数据。
5) AI 笔记总览：用户问「整体看法、有哪些洞察、AI笔记、NotebookLM」等未指定单点时，只调用 showAiNotebookOpinionsAll（无参数）。卡片内已按第一点、第二点、第三点展示全部内容。
6) AI 笔记单点：仅当用户明确追问某一子话题时，调用 showAiNotebookOpinion 并选对 opinionId。
7) 【硬性禁止】调用 showAiNotebookOpinionsAll 或 showAiNotebookOpinion 之后，正文中不得再写编号列表或自然段去复述卡片里已有的标题、缺口、建议；最多允许≤15字短承接（如「需要展开哪一点？」）或结束。
8) 联系：调用 getContactInfo。
9) 页面导航：用户同意深入或要看 STAR 页时调用 navigateToPage；话术像导游。跳转后聊天窗会保持打开，用户可继续追问。
10) 多轮上下文：你会收到「本地持久化对话记忆」含最近 3 条摘要与长期摘要；请连贯承接，除非用户明确换话题。

风格：中文、专业简洁、产品经理视角。`;

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        title="AI 助手"
        style={{
          position: "fixed",
          bottom: 32,
          right: 32,
          zIndex: 300,
          width: 64,
          height: 64,
          borderRadius: "50%",
          cursor: "pointer",
          background: "radial-gradient(circle at 35% 35%, #b48bff, #1a0a4a)",
          boxShadow: open
            ? "0 0 0 3px #00e5ff, 0 0 40px rgba(0,229,255,0.7)"
            : "0 0 0 2px rgba(123,97,255,0.4), 0 0 24px rgba(123,97,255,0.5)",
          border: "none",
          padding: 0,
          overflow: "hidden",
          transition: "transform 0.3s, box-shadow 0.3s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <OrbCanvas />
        <div
          style={{
            position: "absolute",
            inset: -4,
            borderRadius: "50%",
            border: "2px solid rgba(0,229,255,0.3)",
            animation: "orbPulse 2.5s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
      </button>

      <div
        style={{
          position: "fixed",
          bottom: 110,
          right: 32,
          zIndex: 299,
          width: 360,
          maxHeight: 580,
          background: "#0d0f14",
          border: "1px solid rgba(0,229,255,0.2)",
          borderRadius: 12,
          boxShadow: "0 0 0 1px rgba(123,97,255,0.15), 0 20px 60px rgba(0,0,0,0.8)",
          display: "flex",
          flexDirection: "column",
          transform: open ? "scale(1) translateY(0)" : "scale(0.95) translateY(12px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "all" : "none",
          transition: "transform 0.3s cubic-bezier(.16,1,.3,1), opacity 0.25s",
          overflow: "hidden",
          fontFamily: "system-ui, 'Noto Sans SC', sans-serif",
        }}
      >
        {/* Header — 设计稿 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 14px",
            borderBottom: "1px solid rgba(0,229,255,0.1)",
            background: "rgba(0,229,255,0.03)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #b48bff, #1a0a4a)",
                boxShadow: "0 0 8px rgba(123,97,255,0.5)",
                flexShrink: 0,
              }}
            />
            <div>
              <div
                style={{
                  fontSize: 11,
                  color: "#e8eaf0",
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                }}
              >
                AI 助手
              </div>
              <div style={{ fontSize: 10, color: statusColor, marginTop: 2 }}>{statusLine}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {siliconflowCtx && (
              <button
                type="button"
                title="配置硅基流动 API Key（可选）"
                onClick={() => {
                  setKeyPanelOpen((v) => !v);
                  setKeyDraft(siliconflowCtx.userApiKey ?? "");
                }}
                style={{
                  background: siliconflowCtx.userApiKey ? "rgba(0,229,255,0.12)" : "none",
                  border: "1px solid rgba(0,229,255,0.2)",
                  borderRadius: 4,
                  padding: "2px 6px",
                  cursor: "pointer",
                  fontSize: 9,
                  color: "#7fe8f5",
                  letterSpacing: "0.06em",
                }}
              >
                API
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                fontSize: 10,
                color: "rgba(255,255,255,0.25)",
                lineHeight: 1,
              }}
              aria-label="关闭"
            >
              ✕
            </button>
          </div>
        </div>

        {siliconflowCtx && keyPanelOpen && (
          <div
            style={{
              padding: "10px 14px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(0,0,0,0.28)",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.45)",
                marginBottom: 6,
                letterSpacing: "0.04em",
              }}
            >
              硅基流动 API Key（可选）
            </div>
            <p
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.32)",
                marginBottom: 8,
                lineHeight: 1.55,
              }}
            >
              不填则使用服务器上的 SILICONFLOW_API_KEY（本地为 .env.local，线上为 Vercel 环境变量），Key 不会下发到浏览器。填写后仅保存在本机浏览器并随请求发送（请仅在 HTTPS 使用）。
            </p>
            <input
              type="password"
              autoComplete="off"
              value={keyDraft}
              onChange={(e) => setKeyDraft(e.target.value)}
              placeholder="sk-..."
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "8px 10px",
                borderRadius: 6,
                border: "1px solid rgba(0,229,255,0.15)",
                background: "rgba(255,255,255,0.05)",
                color: "#e8eaf0",
                fontSize: 11,
              }}
            />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
              <button
                type="button"
                onClick={() => {
                  siliconflowCtx.setUserApiKey(keyDraft.trim() || null);
                  setKeyPanelOpen(false);
                }}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 11,
                  background: "linear-gradient(135deg, #7b61ff, #00e5ff)",
                  color: "#0a0c10",
                  fontWeight: 600,
                }}
              >
                保存并生效
              </button>
              <button
                type="button"
                onClick={() => {
                  setKeyDraft("");
                  siliconflowCtx.setUserApiKey(null);
                  setKeyPanelOpen(false);
                }}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "1px solid rgba(255,255,255,0.12)",
                  cursor: "pointer",
                  fontSize: 11,
                  background: "transparent",
                  color: "#7a8090",
                }}
              >
                清除（用默认）
              </button>
            </div>
          </div>
        )}

        <WelcomeAnchor />

        <div
          style={{
            padding: "10px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {QUICK_ACTIONS.map(({ label, q, variant }) => (
              <button
                key={label}
                type="button"
                onClick={() => submitCopilotQuestion(q)}
                style={{
                  ...quickChipStyle(variant, false),
                  fontSize: 10,
                  padding: "4px 9px",
                  borderRadius: 20,
                  cursor: "pointer",
                  transition: "border-color 0.15s, background 0.15s, color 0.15s",
                  fontFamily: "'Noto Sans SC',sans-serif",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  const s = quickChipStyle(variant, true);
                  Object.assign(e.currentTarget.style, s as CSSProperties);
                }}
                onMouseLeave={(e) => {
                  const s = quickChipStyle(variant, false);
                  Object.assign(e.currentTarget.style, s as CSSProperties);
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <FcSection text={fcText} />

        <div style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <CopilotChat
            instructions={botInstructions}
            onInProgress={(inProgress) => {
              setStatus(inProgress ? "thinking" : "ready");
            }}
            labels={{
              title: "AI 助手",
              placeholder: "问我关于傅倩娇的任何问题...",
            }}
            className="copilot-custom"
          />
        </div>
      </div>
    </>
  );
}
