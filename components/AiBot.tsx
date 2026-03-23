"use client";
// components/AiBot.tsx — 对话框结构与设计稿 ai_bot_design_spec.html 对齐
import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  useCopilotReadable,
  useCopilotAction,
} from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import { RESUME_DATA } from "@/lib/resumeData";
import type { PageName } from "@/app/page";
import { useSiliconflowUserKeyOptional } from "@/components/CopilotProviders";

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

const sectionMicroLabel: CSSProperties = {
  fontSize: 9,
  color: "rgba(255,255,255,0.28)",
  letterSpacing: "0.1em",
  marginBottom: 7,
};

/** ③ Function Calling — 橙色条 + 文案（设计稿） */
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
      <div style={sectionMicroLabel}>③ Function Calling 过程动画</div>
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

/** ① 欢迎语 + 身份锚定 — 设计稿（不含右侧说明文档里的「痛点」脚注） */
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
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -8,
            left: 12,
            fontSize: 9,
            color: "#7b61ff",
            background: "#0d0f14",
            padding: "0 4px",
            letterSpacing: "0.1em",
          }}
        >
          ① 欢迎语
        </div>
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

// ── Main AiBot Component ─────────────────────────────────────────
export default function AiBot({ navigate, currentPage }: Props) {
  const [open, setOpen] = useState(false);
  const [fcText, setFcText] = useState<string | null>(null);
  const [status, setStatus] = useState<"ready" | "thinking" | "error">("ready");
  const [keyPanelOpen, setKeyPanelOpen] = useState(false);
  const [keyDraft, setKeyDraft] = useState("");
  const siliconflowCtx = useSiliconflowUserKeyOptional();

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
          <div style={sectionMicroLabel}>⑤ AI 直接控制页面跳转</div>
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
      setOpen(false);
      return `已为你打开${pageNavLabel(page)}，聊天窗已收起，方便你阅读页面。`;
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
          <div style={sectionMicroLabel}>④ 结构化结果卡片（而非纯文字）</div>
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
    name: "showAiNotebookOpinion",
    description: "展示傅倩娇对AI笔记产品的具体洞察和迭代建议。当用户问AI笔记、NotebookLM相关问题时调用。",
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
      return (
        <div style={{ margin: "4px 0" }}>
          <div style={sectionMicroLabel}>④ 结构化结果卡片（而非纯文字）</div>
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
                color: "#b8bcc4",
                lineHeight: 1.5,
              }}
            >
              <span style={{ color: "#00e5ff", letterSpacing: "0.06em" }}>建议 </span>
              {op.suggestion}
            </div>
          </div>
        </div>
      );
    },
    handler: async ({ opinionId }) => {
      setFcText("正在检索产品洞察库...");
      await new Promise((r) => setTimeout(r, 700));
      setFcText(null);
      const op = RESUME_DATA.aiNotebookOpinions.find((o) => o.id === opinionId);
      return op ? `已展示「${op.title}」的详细分析` : "未找到对应洞察";
    },
  });

  useCopilotAction({
    name: "getContactInfo",
    description: "获取傅倩娇的联系方式。当用户询问如何联系、微信、邮箱时调用。",
    parameters: [],
    render: ({ status: actionStatus }) => (
      <div style={{ margin: "4px 0" }}>
        <div style={sectionMicroLabel}>④ 结构化结果卡片（而非纯文字）</div>
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

  const submitCopilotQuestion = (q: string) => {
    const input = document.querySelector(".copilot-custom .copilotKitInput textarea") as HTMLTextAreaElement | null;
    if (!input) return;
    const setVal = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
    setVal?.call(input, q);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    const form = input.closest("form");
    form?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  };

  const botInstructions = `你是傅倩娇的专属 AI 助手，面向面试官。

【引导逻辑 — 必须遵守】
1) 分流：界面已有 ① 欢迎语给出方向。用户开口后先用一句话对齐意图：项目/技术、AI 笔记观点、岗位匹配，还是联系方式；不要重复朗读整段欢迎语。
2) 零输入：提醒用户可使用 ② 快捷问题；若用户已通过快捷条发起问题，直接执行对应能力，少废话。
3) 可感知：调用 function 时，用户会在顶部看到 ③ 橙色「正在检索…」状态；你回复保持简洁，不要用大段「我正在思考」凑字。
4) 结构化优先：问项目、指标、STAR 时必须先 showProjectHighlights 出卡片（数字 badge + STAR 按钮），禁止只用长文字堆砌数据。
5) AI 笔记 / NotebookLM：调用 showAiNotebookOpinion，并选一个最贴切的 opinionId。
6) 联系：调用 getContactInfo。
7) 页面导航：用户同意深入或要看 STAR 页时调用 navigateToPage；话术像导游（例如「我来带你看…」），成功后前端会自动收起聊天窗。

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
            <div style={{ ...sectionMicroLabel, marginBottom: 6 }}>硅基流动 API Key（可选）</div>
            <p
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.32)",
                marginBottom: 8,
                lineHeight: 1.55,
              }}
            >
              不填则使用站点内置默认或服务器环境变量；填写后仅保存在本机浏览器，并随请求加密传输（请仅在 HTTPS 环境使用）。
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

        {/* ② 快捷问题 */}
        <div
          style={{
            padding: "10px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            flexShrink: 0,
          }}
        >
          <div style={sectionMicroLabel}>② 快捷问题 — 一键触发，零输入成本</div>
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
