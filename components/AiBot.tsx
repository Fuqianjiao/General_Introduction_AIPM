"use client";
// components/AiBot.tsx — 对话框结构与设计稿 ai_bot_design_spec.html 对齐
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  useCopilotReadable,
  useCopilotAction,
  useCopilotChat,
} from "@copilotkit/react-core";
import { CopilotChat } from "@copilotkit/react-ui";
import { CopilotAssistantMessage } from "@/components/CopilotAssistantMessage";
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

/** 与聊天气泡统一的正文字号（与 globals --ck-bubble-font-size 一致） */
const CARD_BODY_PX = 14;
const CARD_MUTED_PX = 12;
const CARD_BADGE_PX = 12;

interface Props {
  navigate: (page: PageName) => void;
  currentPage: PageName;
}

/** ② 快捷问题 — 文案与设计稿一致；青系胶囊条 */
const QUICK_ACTIONS: { label: string; q: string }[] = [
  { label: "核心项目", q: "她有哪些核心项目经历？" },
  { label: "AI笔记看法", q: "她对 AI 笔记产品有什么洞察？" },
  { label: "岗位匹配度", q: "她与阿里 AI 笔记岗位的匹配度如何？" },
  { label: "技能库", q: "请展示傅倩娇的技术能力图谱与核心技能栈。" },
];

/** 首次欢迎 + 顶部快捷条仅展示一次；之后推荐问题走 Copilot 底部 suggestions */
const CHAT_ONBOARDING_STORAGE_KEY = "fuqianjiao_ai_chat_onboarding_done_v1";

function readChatOnboardingDone(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(CHAT_ONBOARDING_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

type ChatSuggestionItem = { title: string; message: string; className?: string };

function quickChipStyle(hover: boolean): CSSProperties {
  return {
    background: hover ? "rgba(0,229,255,0.1)" : "rgba(0,229,255,0.07)",
    border: `1px solid ${hover ? "rgba(0,229,255,0.35)" : "rgba(0,229,255,0.18)"}`,
    color: hover ? "#9ef5ff" : "#7fe8f5",
  };
}

type ResumeProject = (typeof RESUME_DATA.projects)[number];

/** 单项目结构化卡片（指标 + STAR 跳转），标题/正文强制换行不顶破边框 */
function ProjectHighlightCardUI({
  project,
  actionStatus,
  navigate,
  setOpen,
}: {
  project: ResumeProject;
  actionStatus: string;
  navigate: (page: PageName) => void;
  setOpen: (open: boolean) => void;
}) {
  const metrics = Object.values(project.metrics);
  const starPage: PageName = project.id === "qianniu" ? "project" : "project2";
  const busy = actionStatus === "executing" || actionStatus === "inProgress";
  return (
    <div
      style={{
        margin: "4px 0",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          background: "rgba(0,229,255,0.04)",
          border: "1px solid rgba(0,229,255,0.15)",
          borderRadius: 7,
          padding: "10px 12px",
          boxSizing: "border-box",
          maxWidth: "100%",
          overflow: "hidden",
          wordBreak: "break-word",
          overflowWrap: "break-word",
        }}
      >
        <div
          style={{
            fontSize: CARD_MUTED_PX,
            color: "#00e5ff",
            letterSpacing: "0.1em",
            marginBottom: 6,
          }}
        >
          {busy ? "◆ 加载中…" : "◆ 项目亮点"}
        </div>
        <div
          style={{
            fontSize: CARD_BODY_PX,
            color: "#e8eaf0",
            fontWeight: 500,
            marginBottom: 8,
            lineHeight: 1.45,
            wordBreak: "break-word",
            overflowWrap: "break-word",
          }}
        >
          {project.name}
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 4,
            marginBottom: 8,
            maxWidth: "100%",
          }}
        >
          {metrics.map((m, i) => (
            <span
              key={i}
              style={{
                background: "rgba(123,97,255,0.12)",
                border: "1px solid rgba(123,97,255,0.25)",
                color: "#a898ff",
                fontSize: CARD_BADGE_PX,
                padding: "3px 8px",
                borderRadius: 3,
                lineHeight: 1.35,
                maxWidth: "100%",
                wordBreak: "break-word",
                overflowWrap: "break-word",
                boxSizing: "border-box",
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
            padding: "8px 10px",
            fontFamily: "'Noto Sans SC',sans-serif",
            boxSizing: "border-box",
          }}
        >
          <span style={{ fontSize: CARD_BODY_PX, color: "#7a8090" }}>查看完整 STAR 拆解</span>
          <span style={{ fontSize: CARD_BODY_PX, color: "#00e5ff" }}>→</span>
        </button>
      </div>
    </div>
  );
}

type SkillsSectionId = "ai" | "lowcode" | "product";

function skillsStackChipStyle(section: SkillsSectionId, emphasis: boolean): CSSProperties {
  if (section === "ai") {
    return emphasis
      ? {
          background: "rgba(0,229,255,0.1)",
          border: "1px solid rgba(0,229,255,0.3)",
          color: "#7fe8f5",
          fontSize: 11,
          padding: "3px 9px",
          borderRadius: 4,
          fontWeight: 500,
          maxWidth: "100%",
          wordBreak: "break-word",
          boxSizing: "border-box",
        }
      : {
          background: "rgba(0,229,255,0.05)",
          border: "1px solid rgba(0,229,255,0.12)",
          color: "#7a9ea5",
          fontSize: 11,
          padding: "3px 9px",
          borderRadius: 4,
          maxWidth: "100%",
          wordBreak: "break-word",
          boxSizing: "border-box",
        };
  }
  if (section === "lowcode") {
    return emphasis
      ? {
          background: "rgba(123,97,255,0.12)",
          border: "1px solid rgba(123,97,255,0.3)",
          color: "#a898ff",
          fontSize: 11,
          padding: "3px 9px",
          borderRadius: 4,
          fontWeight: 500,
          maxWidth: "100%",
          wordBreak: "break-word",
          boxSizing: "border-box",
        }
      : {
          background: "rgba(123,97,255,0.06)",
          border: "1px solid rgba(123,97,255,0.15)",
          color: "#8878c0",
          fontSize: 11,
          padding: "3px 9px",
          borderRadius: 4,
          maxWidth: "100%",
          wordBreak: "break-word",
          boxSizing: "border-box",
        };
  }
  return {
    background: "rgba(74,168,160,0.08)",
    border: "1px solid rgba(74,168,160,0.2)",
    color: "#5cbcb4",
    fontSize: 11,
    padding: "3px 9px",
    borderRadius: 4,
    maxWidth: "100%",
    wordBreak: "break-word",
    boxSizing: "border-box",
  };
}

/** 技术栈结构化卡片（对齐 skills_card 设计稿） */
function SkillsStackCardUI({
  busy,
  navigate,
  setOpen,
}: {
  busy: boolean;
  navigate: (page: PageName) => void;
  setOpen: (open: boolean) => void;
}) {
  const data = RESUME_DATA.skillsChatCard;
  return (
    <div
      style={{
        margin: "4px 0",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        wordBreak: "break-word",
        overflowWrap: "break-word",
      }}
    >
      <div
        style={{
          background: "#0d0f14",
          border: "1px solid rgba(0,229,255,0.2)",
          borderRadius: 10,
          overflow: "hidden",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        <div style={{ padding: "12px 14px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div
            style={{
              fontSize: 9,
              color: "#00e5ff",
              letterSpacing: "0.12em",
              marginBottom: 3,
            }}
          >
            {busy ? "◆ 加载中…" : "◆ 技术能力图谱"}
          </div>
          <div style={{ fontSize: 13, color: "#e8eaf0", fontWeight: 500 }}>核心技术栈 · 傅倩娇</div>
        </div>

        {data.sections.map((sec) => (
          <div
            key={sec.id}
            style={{
              padding: "10px 14px",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <div
                style={{
                  width: 3,
                  height: 12,
                  background: sec.barColor,
                  borderRadius: 2,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 10, color: sec.titleColor, letterSpacing: "0.1em" }}>{sec.title}</span>
              {sec.rightBadge ? (
                <span style={{ fontSize: 9, color: "#7a8090", marginLeft: "auto" }}>{sec.rightBadge}</span>
              ) : null}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {sec.chips.map((ch, i) => (
                <span
                  key={`${sec.id}-${i}-${ch.label}`}
                  style={skillsStackChipStyle(sec.id, sec.id === "product" ? true : ch.emphasis)}
                >
                  {ch.label}
                </span>
              ))}
            </div>
          </div>
        ))}

        <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div
            style={{
              fontSize: 9,
              color: "#7a8090",
              letterSpacing: "0.1em",
              marginBottom: 7,
            }}
          >
            {data.deliveryNote}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {data.delivery.map((cell) => (
              <div
                key={cell.label}
                style={{
                  flex: "1 1 80px",
                  minWidth: 72,
                  background: "rgba(0,229,255,0.04)",
                  border: "1px solid rgba(0,229,255,0.1)",
                  borderRadius: 5,
                  padding: "8px 10px",
                  textAlign: "center",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 700, color: "#00e5ff", lineHeight: 1 }}>{cell.value}</div>
                <div style={{ fontSize: 9, color: "#7a8090", marginTop: 3 }}>{cell.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: "10px 14px" }}>
          <button
            type="button"
            onClick={() => {
              navigate(data.cta.targetPage);
              setOpen(false);
            }}
            style={{
              width: "100%",
              background: "rgba(0,229,255,0.06)",
              border: "1px solid rgba(0,229,255,0.18)",
              borderRadius: 6,
              padding: "8px 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              fontFamily: "'Noto Sans SC',sans-serif",
              boxSizing: "border-box",
            }}
          >
            <span style={{ fontSize: 11, color: "#7fe8f5", textAlign: "left" }}>{data.cta.label}</span>
            <span style={{ fontSize: 12, color: "#00e5ff", flexShrink: 0 }}>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/** 岗位匹配度结构化卡片（对齐 match_score_card 设计稿）+ 底部双 CTA */
function JobMatchCardWithContact({
  busy,
  navigate,
  setOpen,
}: {
  busy: boolean;
  navigate: (page: PageName) => void;
  setOpen: (open: boolean) => void;
}) {
  const [showContact, setShowContact] = useState(false);
  const data = RESUME_DATA.jobMatchAliAiNotebookCard;

  return (
    <div
      style={{
        margin: "4px 0",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        wordBreak: "break-word",
        overflowWrap: "break-word",
      }}
    >
      <div
        style={{
          background: "#0d0f14",
          border: "1px solid rgba(0,229,255,0.2)",
          borderRadius: 10,
          overflow: "hidden",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "12px 14px 10px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 9,
                color: "#00e5ff",
                letterSpacing: "0.12em",
                marginBottom: 3,
              }}
            >
              {busy ? "◆ 生成中…" : "◆ 岗位匹配度分析"}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#e8eaf0",
                fontWeight: 500,
                lineHeight: 1.35,
              }}
            >
              {data.jobTitle}
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#00e5ff", lineHeight: 1 }}>
              {data.overallScore}
            </div>
            <div style={{ fontSize: 9, color: "#7a8090", marginTop: 1 }}>综合匹配</div>
          </div>
        </div>

        {/* Dimensions */}
        <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div
            style={{
              fontSize: 9,
              color: "#7a8090",
              letterSpacing: "0.1em",
              marginBottom: 9,
            }}
          >
            逐项对照 JD 要求
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.dimensions.map((d, i) => {
              const weak = Boolean(d.weakTag);
              return (
                <div key={i}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 4,
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      <span style={{ fontSize: 11, color: "#c8cacc", lineHeight: 1.35 }}>{d.label}</span>
                      {d.weakTag ? (
                        <span
                          style={{
                            fontSize: 9,
                            flexShrink: 0,
                            background: "rgba(240,160,64,0.12)",
                            border: "1px solid rgba(240,160,64,0.3)",
                            color: "#f0a040",
                            padding: "1px 5px",
                            borderRadius: 3,
                          }}
                        >
                          {d.weakTag}
                        </span>
                      ) : null}
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        color: weak ? "#f0a040" : "#00e5ff",
                        fontWeight: 500,
                        flexShrink: 0,
                      }}
                    >
                      {d.percent}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 3,
                      background: "rgba(255,255,255,0.06)",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${d.percent}%`,
                        borderRadius: 2,
                        background: weak
                          ? "linear-gradient(90deg, #f0a040, #f0c040)"
                          : "linear-gradient(90deg, #7b61ff, #00e5ff)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 最强匹配点 */}
        <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div
            style={{
              fontSize: 9,
              color: "#7a8090",
              letterSpacing: "0.1em",
              marginBottom: 7,
            }}
          >
            {data.strengthHeading}
          </div>
          <div
            style={{
              background: "rgba(0,229,255,0.04)",
              borderLeft: "2px solid rgba(0,229,255,0.4)",
              padding: "7px 10px",
              borderRadius: "0 4px 4px 0",
              fontSize: 11,
              color: "#a0c8d0",
              lineHeight: 1.6,
            }}
          >
            {data.strengthBody}
          </div>
        </div>

        {/* 潜在缺口 */}
        <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div
            style={{
              fontSize: 9,
              color: "#7a8090",
              letterSpacing: "0.1em",
              marginBottom: 7,
            }}
          >
            {data.gapHeading}
          </div>
          <div
            style={{
              background: "rgba(240,160,64,0.04)",
              borderLeft: "2px solid rgba(240,160,64,0.35)",
              padding: "7px 10px",
              borderRadius: "0 4px 4px 0",
              fontSize: 11,
              color: "#c8a870",
              lineHeight: 1.6,
            }}
          >
            {data.gapBody}
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: "10px 14px", display: "flex", gap: 7 }}>
          <button
            type="button"
            onClick={() => {
              navigate("main");
              setOpen(false);
              if (typeof window !== "undefined") {
                window.setTimeout(() => {
                  document.getElementById("match")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 280);
              }
            }}
            style={{
              flex: 1,
              background: "rgba(0,229,255,0.06)",
              border: "1px solid rgba(0,229,255,0.18)",
              borderRadius: 6,
              padding: 8,
              textAlign: "center",
              cursor: "pointer",
              fontFamily: "'Noto Sans SC',sans-serif",
            }}
          >
            <div style={{ fontSize: 10, color: "#00e5ff" }}>查看项目佐证 →</div>
          </button>
          <button
            type="button"
            onClick={() => setShowContact((v) => !v)}
            style={{
              flex: 1,
              background: "rgba(123,97,255,0.06)",
              border: "1px solid rgba(123,97,255,0.2)",
              borderRadius: 6,
              padding: 8,
              textAlign: "center",
              cursor: "pointer",
              fontFamily: "'Noto Sans SC',sans-serif",
            }}
          >
            <div style={{ fontSize: 10, color: "#a898ff" }}>直接联系她 →</div>
          </button>
        </div>

        {showContact ? (
          <div
            style={{
              padding: "0 14px 12px",
              borderTop: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div
              style={{
                marginTop: 10,
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
                联系方式
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
        ) : null}
      </div>
    </div>
  );
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

/** 欢迎语（字号/圆角/内边距与对话气泡 token 一致；不含设计稿标注） */
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
          background: "rgba(255,255,255,0.085)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 12,
          padding: "16px 22px",
          fontSize: 14,
          fontWeight: 400,
          color: "#e8eaf0",
          lineHeight: 1.6,
          wordBreak: "break-word",
          overflowWrap: "break-word",
          fontFamily: "'Noto Sans SC',sans-serif",
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
  const keyAutoOpenedRef = useRef(false);
  const [chatOnboardingDone, setChatOnboardingDone] = useState(false);
  const footerFollowUps = useMemo<ChatSuggestionItem[]>(
    () =>
      QUICK_ACTIONS.map(({ label, q }) => ({
        title: label,
        message: q,
        className: "suggestion-chip-tech",
      })),
    [],
  );

  const completeChatOnboarding = () => {
    try {
      window.localStorage.setItem(CHAT_ONBOARDING_STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setChatOnboardingDone(true);
  };

  useEffect(() => {
    setChatOnboardingDone(readChatOnboardingDone());
  }, []);

  const { appendMessage, visibleMessages } = useCopilotChat();
  const [chatMemory, setChatMemory] = useState<StoredChatMemory>(() => loadChatMemory());
  const memorySyncSig = useRef("");

  /** 服务端未配置 Key 时，首次打开面板自动展开配置区，避免用户不知道要填哪 */
  useEffect(() => {
    if (!open || !siliconflowCtx) return;
    if (siliconflowCtx.userApiKey) return;
    if (siliconflowCtx.serverKeyConfigured !== false) return;
    if (keyAutoOpenedRef.current) return;
    setKeyPanelOpen(true);
    keyAutoOpenedRef.current = true;
  }, [open, siliconflowCtx]);

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
    description:
      "展示单个项目的核心亮点与指标卡片（含跳转 STAR 页按钮）。仅当用户只问某一个项目、或深挖某一项目细节时使用；核心项目总览请用 showCoreProjectsOverview。",
    parameters: [
      {
        name: "projectId",
        type: "string",
        description:
          "项目ID：'qianniu'=千牛电商客服全托管对话系统（跳转 project 页）, 'feiqí'=飞棋RPA工具全链路AI能力升级（跳转 project2 页）",
        enum: ["qianniu", "feiqí"],
        required: true,
      },
    ],
    render: ({ status: actionStatus, args }) => {
      const project = RESUME_DATA.projects.find((p) => p.id === args.projectId);
      if (!project) return null;
      return (
        <ProjectHighlightCardUI
          project={project}
          actionStatus={actionStatus}
          navigate={navigate}
          setOpen={setOpen}
        />
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
    name: "showCoreProjectsOverview",
    description:
      "一次性并排展示「千牛电商客服全托管对话系统」与「飞棋RPA工具全链路AI能力升级」两张结构化项目卡片（指标+STAR 跳转按钮）。当用户问「有哪些核心项目经历」「核心项目有哪些」「项目经历」等总览问题时必须调用本工具（一次即可），禁止只用纯文字编号列表代替。",
    parameters: [],
    render: ({ status: actionStatus }) => {
      const order = ["qianniu", "feiqí"] as const;
      const projects = order
        .map((id) => RESUME_DATA.projects.find((p) => p.id === id))
        .filter((p): p is ResumeProject => Boolean(p));
      return (
        <div
          style={{
            margin: "4px 0",
            width: "100%",
            maxWidth: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            boxSizing: "border-box",
          }}
        >
          {projects.map((p) => (
            <ProjectHighlightCardUI
              key={p.id}
              project={p}
              actionStatus={actionStatus}
              navigate={navigate}
              setOpen={setOpen}
            />
          ))}
          </div>
      );
    },
    handler: async () => {
      setFcText("正在检索项目数据库...");
      await new Promise((r) => setTimeout(r, 700));
      setFcText(null);
      return "已展示千牛与飞棋两个核心项目的结构化卡片；请点击各卡片底部「查看完整 STAR 拆解」进入对应详情页。正文请勿重复罗列卡片内指标。";
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
    name: "showSkillsStackCard",
    description:
      "展示「技术能力图谱」结构化卡片：三层技能（AI 产品能力 / 低代码自动化 / 产品工具链）、深浅标签区分主辅、实战交付数据（64 应用 / 26 平台 / 95% 满意度）、底部跳转千牛 RAG 项目案例。用户问技术栈、技能、会用哪些工具、能力图谱等时必须调用（无参数），禁止只用纯文字列表代替。",
    parameters: [],
    render: ({ status: actionStatus }) => (
      <SkillsStackCardUI
        busy={actionStatus === "executing" || actionStatus === "inProgress"}
        navigate={navigate}
        setOpen={setOpen}
      />
    ),
    handler: async () => {
      setFcText("正在生成技术栈卡片...");
      await new Promise((r) => setTimeout(r, 550));
      setFcText(null);
      return "已展示结构化技术栈卡片；请勿在正文中逐条复述标签与数字，最多一句总括或引导点击底部「RAG 项目案例」。";
    },
  });

  useCopilotAction({
    name: "showJobMatchCard",
    description:
      "展示「与阿里 AI 笔记 · 产品经理」岗位的结构化匹配度卡片：综合分、逐项 JD 进度条（含待加强标签）、最强匹配点、潜在缺口、底部「查看项目佐证」「直接联系她」。用户问岗位匹配度、JD 匹配、面试匹配分析等时必须调用（无参数），禁止只用长文字代替。",
    parameters: [],
    render: ({ status: actionStatus }) => (
      <JobMatchCardWithContact
        busy={actionStatus === "executing" || actionStatus === "inProgress"}
        navigate={navigate}
        setOpen={setOpen}
      />
    ),
    handler: async () => {
      setFcText("正在生成岗位匹配度分析...");
      await new Promise((r) => setTimeout(r, 650));
      setFcText(null);
      return "已展示结构化岗位匹配度卡片；请勿在正文中逐条复述分数与进度条内容，最多一句总括或引导使用卡片底部按钮。";
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

  const usingOwnKey = Boolean(siliconflowCtx?.userApiKey);
  const serverReady = siliconflowCtx?.serverKeyConfigured === true;
  const serverMissing = siliconflowCtx?.serverKeyConfigured === false;

  const statusLine =
    status === "thinking"
      ? "● 思考中..."
      : status === "error"
        ? "● 错误"
        : serverMissing && !usingOwnKey
          ? "● 请先完成 API 配置"
          : serverReady && !usingOwnKey
            ? "● 就绪 · 开箱即用"
            : usingOwnKey
              ? "● 就绪 · 自有 Key"
              : "● 就绪";

  const statusColor =
    status === "thinking"
      ? "#f0a040"
      : status === "error"
        ? "#ff6b6b"
        : serverMissing && !usingOwnKey
          ? "#f0a040"
          : "#00e5ff";

  /** 站点已在服务端配好 Key 时，不在标题栏强调「API」入口，减少小白认知负担 */
  const hideHeaderApiButton =
    siliconflowCtx?.serverKeyConfigured === true && !siliconflowCtx?.userApiKey;
  const apiButtonLabel =
    serverMissing && !usingOwnKey ? "配置 API" : "API";

  /** 走 CopilotKit 官方 API；勿改 DOM：输入框是受控组件，伪造 input/submit 不会更新 React state，也不会触发发送 */
  const submitCopilotQuestion = (q: string) => {
    completeChatOnboarding();
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
4) **核心项目总览**（如「她有哪些核心项目经历」「有哪些核心项目」「项目经历有哪些」）：正文最多 1～2 句总起；**必须调用一次** showCoreProjectsOverview（无参数），会同时出现千牛、飞棋**两张**结构化卡片并可跳转 STAR 页。**禁止**仅用 Markdown 编号列表描述两项目而不调用本工具；**禁止**用两次 showProjectHighlights 代替（总览只用 showCoreProjectsOverview）。
5) **单项目或深挖**：只问千牛或只问飞棋某一侧时，调用 showProjectHighlights 并传对应 projectId；禁止只用长文字堆砌数据。
6) **岗位匹配度**：用户问「与阿里 AI 笔记岗位匹配度」「岗位匹配」「JD 匹配」「面试匹配」等时，**必须调用一次** showJobMatchCard（无参数），展示综合分、JD 维度进度条、最强匹配点、潜在缺口与双 CTA。**禁止**仅用 Markdown 列表复述各维度分数；正文最多一句总括。
7) **技术栈与技能**：用户问「技术栈」「技能有哪些」「会用哪些工具」「能力图谱」等时，**必须调用一次** showSkillsStackCard（无参数）。**禁止**仅用 Markdown 标签列表代替卡片；正文最多一句总括。
8) AI 笔记总览：用户问「整体看法、有哪些洞察、AI笔记、NotebookLM」等未指定单点时，只调用 showAiNotebookOpinionsAll（无参数）。卡片内已按第一点、第二点、第三点展示全部内容。
9) AI 笔记单点：仅当用户明确追问某一子话题时，调用 showAiNotebookOpinion 并选对 opinionId。
10) 【硬性禁止】调用 showAiNotebookOpinionsAll 或 showAiNotebookOpinion 之后，正文中不得再写编号列表或自然段去复述卡片里已有的标题、缺口、建议；最多允许≤15字短承接（如「需要展开哪一点？」）或结束。
11) 联系：用户明确要联系方式且未在岗位匹配卡片内展开时，调用 getContactInfo；**不要**在卡片外再用自然段重复微信/邮箱/简历链接。
12) 页面导航：用户同意深入或要看 STAR 页时调用 navigateToPage；话术像导游。跳转后聊天窗会保持打开，用户可继续追问。
13) 多轮上下文：你会收到「本地持久化对话记忆」含最近 3 条摘要与长期摘要；请连贯承接，除非用户明确换话题。

【卡片 vs 自由问答 — 分流（防空白回复）】
- **只有**用户意图**明确对应**下方某条「引导逻辑」里的 Function 时，才调用该工具（展示卡片）。**禁止**在模糊提问上强行调用卡片后又不在气泡里写任何字。
- 泛指「工作经验」「工作背景」「经历」「她是谁」「擅长什么」「怎么样」等，且**没有**同时表达「有哪些核心项目」「项目经历有哪些」「项目总览」「看两个项目」「岗位匹配度」「JD」「技术栈」「能力图谱」「AI笔记看法」「联系方式」等**明确触发**时：**不要调用任何卡片工具**，只用「自由问答规则」输出 50～120 字纯文本（可概括两段任职：分叉科技 / 乐麦 + 角色与方向），**禁止沉默**。
- **禁止**仅因出现「经验」「经历」就调用 showCoreProjectsOverview；该工具只用于用户**明确要**千牛+飞棋两项目并排卡片时（见上文第 4 条典型问法）。
- 用户一句话太模糊、无法判断要卡片还是聊天时：允许用**不超过 2 句**口语反问澄清（仍属自由问答、不调用工具），例如「你更想先看她的项目落地案例，还是和阿里 JD 的匹配分析？」澄清后再按需调用工具。

风格：中文、专业简洁、产品经理视角。

【输出总原则 — 禁止沉默】每一轮回复都必须有可见的助手气泡文字（卡片回合为短气泡，自由问答为长气泡），**不允许**整轮无任何文字。

【卡片回合气泡规则】本回合若调用了任一前端结构化卡片（getContactInfo、showCoreProjectsOverview、showJobMatchCard、showSkillsStackCard、showProjectHighlights、showAiNotebookOpinionsAll 等），你必须在展示卡片的同时输出**≤25 字**的纯文本气泡：口语化、无 Markdown、不复述卡片内已有数据；**禁止**沉默、**禁止**用长段落或列表复述卡片内容。界面以卡片为主，底部操作栏与快捷条照常。

【非卡片回合 — 自由问答】当用户的问题**未**触发任何 Function（无上述卡片）时，你必须用**50～120 字**的纯文本气泡回复（口语化、结尾带一句引导），规则见下文「自由问答规则」。

---
【自由问答规则 — 优先级最高】
当用户提的问题不触发任何 Function（卡片），必须用气泡文字回复，不允许沉默。回复规范：
1. 字数：50～120 字之间，不超过 3 句话
2. 禁止 Markdown（无 **加粗**、无列表、无标题）
3. 语气：像真人助手，口语化，不要官方腔
4. 内容：基于 RESUME_DATA 里的真实信息回答，不要编造
5. 结尾：用一句引导语带出相关的快捷问题，例如「想看她的项目细节吗？」「要看岗位匹配度分析吗？」

示例（用户问「她工作经验怎么样」）：
"倩娇有两段 AI 产品经验，分叉科技做过 SaaS 平台运营，乐麦信息做低代码产品负责人，都有真实的业务数据支撑。想看她的核心项目拆解吗？"

示例（用户问「她是什么学校」）：
"河北农业大学物联网工程专业，GPA 3.51，top 15%。本科背景偏工程，但工作后两年都在做 AI 产品落地，方向转得比较彻底。想了解她的技术栈吗？"

示例（用户问「她有什么优势」）：
"她的差异点是既做过 RAG 知识库的产品设计，也是 NotebookLM 的重度用户——懂技术架构又有用户视角，两者叠在一起在 AI 笔记方向比较少见。要看岗位匹配度分析吗？"
---`;

  return (
    <>
      <button
        type="button"
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
            {siliconflowCtx && !hideHeaderApiButton && (
          <button
                type="button"
                title={
                  serverMissing && !usingOwnKey
                    ? "需要配置硅基流动 API Key，或部署时设置 SILICONFLOW_API_KEY"
                    : "配置硅基流动 API Key（可选，覆盖站点默认）"
                }
                onClick={() => {
                  setKeyPanelOpen((v) => !v);
                  setKeyDraft(siliconflowCtx.userApiKey ?? "");
                }}
                style={{
                  background: siliconflowCtx.userApiKey ? "rgba(0,229,255,0.12)" : "none",
                  border:
                    serverMissing && !usingOwnKey
                      ? "1px solid rgba(240,160,64,0.45)"
                      : "1px solid rgba(0,229,255,0.2)",
                  borderRadius: 4,
                  padding: "2px 6px",
                  cursor: "pointer",
                  fontSize: 9,
                  color: serverMissing && !usingOwnKey ? "#f0c080" : "#7fe8f5",
                  letterSpacing: "0.06em",
                }}
              >
                {apiButtonLabel}
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
              {serverMissing && !usingOwnKey
                ? "需要硅基流动 API Key"
                : "硅基流动 API Key（可选）"}
            </div>
            <p
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.32)",
                marginBottom: 8,
                lineHeight: 1.55,
              }}
            >
              {serverMissing && !usingOwnKey
                ? "当前站点未在服务器配置 SILICONFLOW_API_KEY（且无内置兜底）。请在此填写你的 Key 并保存；或在 .env.local / Vercel 环境变量中配置后重新部署。填写后仅保存在本机浏览器（请仅在 HTTPS 使用）。"
                : "默认已使用服务器上的 SILICONFLOW_API_KEY（本地 .env.local、线上 Vercel），无需在此填写即可对话。仅在希望使用自己的 Key 时填写；保存后仅存在本机浏览器并随请求发送（请仅在 HTTPS 使用）。"}
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

        {!chatOnboardingDone && (
          <>
            <WelcomeAnchor />

            <div
              style={{
                padding: "10px 14px 12px",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                {QUICK_ACTIONS.map(({ label, q }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => submitCopilotQuestion(q)}
                    style={{
                      ...quickChipStyle(false),
                      fontSize: 11,
                      padding: "4px 10px",
                      borderRadius: 999,
                      cursor: "pointer",
                      transition: "border-color 0.15s, background 0.15s, color 0.15s",
                      fontFamily: "'Noto Sans SC',sans-serif",
                      whiteSpace: "nowrap",
                      fontWeight: 500,
                      lineHeight: 1.35,
                    }}
                    onMouseEnter={(e) => {
                      const s = quickChipStyle(true);
                      Object.assign(e.currentTarget.style, s as CSSProperties);
                    }}
                    onMouseLeave={(e) => {
                      const s = quickChipStyle(false);
                      Object.assign(e.currentTarget.style, s as CSSProperties);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <FcSection text={fcText} />

        <div style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <CopilotChat
            instructions={botInstructions}
            AssistantMessage={CopilotAssistantMessage}
            /* 首次引导：仅顶部快捷；完成后输入框上方常显同一组推荐问题 */
            suggestions={chatOnboardingDone ? footerFollowUps : []}
            onSubmitMessage={() => {
              completeChatOnboarding();
            }}
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

        {siliconflowCtx?.serverKeyConfigured === true && !siliconflowCtx.userApiKey && (
          <div
            style={{
              flexShrink: 0,
              padding: "6px 14px 10px",
              borderTop: "1px solid rgba(255,255,255,0.05)",
              textAlign: "center",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setKeyPanelOpen(true);
                setKeyDraft(siliconflowCtx.userApiKey ?? "");
              }}
              style={{
                background: "none",
                border: "none",
                padding: "4px 8px",
                cursor: "pointer",
                fontSize: 9,
                color: "rgba(255,255,255,0.28)",
                letterSpacing: "0.04em",
                textDecoration: "underline",
                textUnderlineOffset: 2,
              }}
            >
              使用自己的硅基流动 Key（可选）
            </button>
        </div>
        )}
      </div>
    </>
  );
}
