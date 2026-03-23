"use client";
// components/MainPage.tsx
// 这里放主页所有内容，从现有的 index.html 迁移过来
// 为了保持代码整洁，样式用 inline style + CSS variables

import { RESUME_DATA } from "@/lib/resumeData";
import type { PageName } from "@/app/page";
import { useState } from "react";

interface Props { navigate: (page: PageName) => void; }

// ── Skill popup data (same as before) ────────────────────────────
const POPUP_DATA: Record<string, { tag: string; title: string; evidences: { label: string; text: string }[]; projects: { tag: string; name: string; page: PageName }[] }> = {
  llm: {
    tag: "LLM / RAG / AGENT",
    title: "LLM / RAG / Agent 能力理解 · 95%",
    evidences: [
      { label: "千牛对话系统", text: "设计「问题优化专家→知识库三层召回→回复专家」串行链路，向量检索+关键词过滤混合召回，BERT模型意图识别准确率89%。" },
      { label: "Prompt工程实践", text: "元数据注入解决幻觉问题；fallback_level四梯度设计是RAG工程中「召回后处理」的典型设计。" },
    ],
    projects: [
      { tag: "PROJECT 01", name: "千牛电商客服全托管对话系统", page: "project" },
      { tag: "PROJECT 02", name: "飞棋RPA工具全链路AI能力升级", page: "project2" },
    ],
  },
  product: {
    tag: "0→1 产品设计",
    title: "0→1 产品设计经验 · 90%",
    evidences: [
      { label: "飞棋RPA AI能力升级", text: "从识别痛点、访谈工程师、制定三模块优先级，到设计「DOM→语义→多路径」链路，完整的0→1产品设计路径。" },
      { label: "千牛对话系统架构", text: "设计三层知识体系；三级转化漏斗找到41%的歧义流失漏洞，AB测试验证转化率提升27%。" },
    ],
    projects: [
      { tag: "PROJECT 02", name: "飞棋RPA工具全链路AI能力升级", page: "project2" },
      { tag: "PROJECT 01", name: "千牛电商客服全托管对话系统", page: "project" },
    ],
  },
  knowledge: {
    tag: "知识库 / PKM 场景",
    title: "知识库 / 个人知识管理场景 · 85%",
    evidences: [
      { label: "三级知识体系设计", text: "标准层（向量检索）、扩展层（混合召回）、应急层（精确匹配）——这套分层逻辑可直接类比AI笔记产品的知识组织架构。" },
      { label: "NotebookLM重度实践", text: "用NotebookLM做Prompt微调（三元组闭环）和口播稿打磨（多文档联合约束生成），深度理解个人知识库的用户路径与痛点。" },
    ],
    projects: [{ tag: "PROJECT 01", name: "千牛电商客服全托管对话系统", page: "project" }],
  },
  cend: {
    tag: "C端产品思维",
    title: "C端用户产品思维 · 80%",
    evidences: [
      { label: "用户分层运营", text: "用户分层与画像分析，识别不同用户群体特征，策划线上活动；设计100+通用工作流模板，应用市场月活提升80%。" },
      { label: "反馈闭环设计", text: "点踩→弹出二级标签→触发知识库修订→自动更新微调数据；会话结束3分钟推送满意度调查——C端习惯养成路径的典型设计。" },
    ],
    projects: [{ tag: "PROJECT 01", name: "千牛电商客服全托管对话系统", page: "project" }],
  },
  collab: {
    tag: "大厂协作 / 跨团队推进",
    title: "大厂协作 / 跨团队推进 · 82%",
    evidences: [
      { label: "交付体系建设", text: "主导/参与交付64个应用，覆盖26个平台，70%项目7天内完成，客户满意度95%。" },
      { label: "产品落地对接", text: "参与需求评审与功能排期，对接前后端开发，制定测试用例——保证迭代节奏稳定可控的跨团队协作经验。" },
    ],
    projects: [{ tag: "PROJECT 02", name: "飞棋RPA工具全链路AI能力升级", page: "project2" }],
  },
  exp: {
    tag: "AI产品经验年限",
    title: "AI产品经验年限（1-3年）· 100%",
    evidences: [
      { label: "分叉科技 2024.07-2025.04", text: "SaaS+MaaS平台运营，研究Dify/扣子等LLMOps产品；头部客户年化降本150W+。" },
      { label: "乐麦信息 2025.05至今", text: "低代码平台产品负责人+AI交付产品经理，飞棋RPA三大模块AI能力升级；刚好满足JD要求的1-3年AI PM经验区间。" },
    ],
    projects: [
      { tag: "PROJECT 01", name: "千牛电商客服全托管对话系统", page: "project" },
      { tag: "PROJECT 02", name: "飞棋RPA工具全链路AI能力升级", page: "project2" },
    ],
  },
};

const BARS = [
  { key: "llm", label: "LLM / RAG / Agent 能力理解", pct: 95, cls: "bar-fill-95" },
  { key: "product", label: "0→1 产品设计经验", pct: 90, cls: "bar-fill-90" },
  { key: "knowledge", label: "知识库 / 个人知识管理场景", pct: 85, cls: "bar-fill-85" },
  { key: "cend", label: "C 端用户产品思维", pct: 80, cls: "bar-fill-80" },
  { key: "collab", label: "大厂协作 / 跨团队推进", pct: 82, cls: "bar-fill-82" },
  { key: "exp", label: "AI 产品经验年限（1-3年）", pct: 100, cls: "bar-fill-100" },
];

/** 工具链拟人化 · 数字团队（展示在页首 Hero 右侧） */
const DIGITAL_TEAM: { role: string; tool: string; duty: string; accent: "cyan" | "violet" }[] = [
  { role: "视觉设计（UED）", tool: "Lovart", duty: "负责全局 UI 视觉风格与赛博朋克元素定义", accent: "cyan" },
  { role: "前端开发（FE）", tool: "Claude", duty: "负责 Next.js 架构搭建、复杂逻辑实现与调试", accent: "violet" },
  { role: "PE 工程师", tool: "Gemini", duty: "负责核心 Prompt 调优与长上下文数据处理", accent: "cyan" },
  { role: "AI 交互", tool: "CopilotKit", duty: "提供原生 AI 助手 UI 及 Function Calling 框架", accent: "violet" },
  { role: "基础设施", tool: "Vercel", duty: "提供 CI/CD 自动化部署与全球边缘加速", accent: "cyan" },
];

const ACC_ITEMS = [
  {
    id: "acc1",
    num: "01 · 资源入口能力",
    title: "拓展资源来源边界：连接器 + MCP 双轨并进",
    tagline: "连接器和MCP本质是同一问题——知识的入口太窄，洞察也无法变成行动。",
    gap: "目前信息来源仅限手动上传、粘贴文字和有限网络抓取；同时NotebookLM是封闭的知识消费系统——能帮你理解知识，但无法执行动作，知识与行动之间有一道墙。",
    suggestion: "两条路并行推进：① 连接器——参考Claude的100+连接器体系，支持Notion/Slack/Gmail等主流SaaS直连；② MCP协议——支持官方与社区MCP，让知识驱动行动：读完会议纪要→自动创建Jira任务。真正的个人助理，应该能把洞察转化为执行。",
    ref: "MCP是Anthropic主导推动的开放协议，Claude连接器已覆盖100+工具，是目前最成熟的参考实现",
  },
  {
    id: "acc2",
    num: "02 · 知识积累能力",
    title: "补足知识管理能力，而不只是知识消费",
    tagline: "AI笔记解决了「消化」，但「资料坟场」的根因在于「积累」环节缺失。",
    gap: "NotebookLM自身无双向链接、图谱化展示、分层管理功能。上传的资料仅能按「笔记本」简单分类，无法形成用户的个性化知识体系——仅解决了「消化」环节，未解决「积累」环节。",
    suggestion: "① 双向链接+知识图谱——让AI推断知识缺口；② 分层标签体系——支持用户定义分类框架；③ 知识健康度提示——主动告知哪些知识过时、哪些领域缺少关联文献。",
    ref: "Obsidian擅长积累，NotebookLM擅长消化。真正的PKM杀手级产品应该是两者的融合",
  },
  {
    id: "acc3",
    num: "03 · 交互模式升级",
    title: "从被动问答走向主动洞察与个性化适配",
    tagline: "习惯养成的本质，是让用户感到「这个AI越来越懂我」。",
    gap: "当前AI笔记交互仍以「用户提问→AI回答」被动模式为主：① 无主动知识洞察——无法主动推送「未关联知识点、潜在研究方向、待补充资料」；② 无个性化适配——无法根据专业水平调整回答深度，也无法记忆使用偏好与输出风格。",
    suggestion: "① 主动知识推送——「你上周整理的竞品分析和今天新上传的行业报告有3个关键数据出入，要对比看看吗？」；② 用户画像+个性化记忆——让每次对话都站在上次的基础上。",
    ref: "参照：Mem.ai的主动知识关联、Notion AI的用户风格记忆、Claude Projects的持久记忆机制",
  },
];

export default function MainPage({ navigate }: Props) {
  const [popupKey, setPopupKey] = useState<string | null>(null);
  const [openAcc, setOpenAcc] = useState<string | null>(null);
  const [fabOpen, setFabOpen] = useState(false);

  const popup = popupKey ? POPUP_DATA[popupKey] : null;

  const s: Record<string, React.CSSProperties> = {
    section: { padding: "100px 60px" },
    sectionLabel: { fontFamily: "'Space Mono',monospace", fontSize: 11, color: "var(--accent)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 },
    sectionTitle: { fontFamily: "'Noto Serif SC',serif", fontSize: "clamp(28px,4vw,42px)", fontWeight: 300, lineHeight: 1.3, marginBottom: 16 },
    sectionDesc: { color: "var(--text-dim)", fontSize: 15, lineHeight: 1.8, maxWidth: 560, marginBottom: 60 },
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" } as React.CSSProperties}>

      {/* ── HERO：左介绍 + 右「数字团队」卡片 ── */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: "100px 60px 60px", position: "relative", overflow: "hidden" } as React.CSSProperties}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 70% 50%,rgba(0,229,255,.06) 0%,transparent 70%),radial-gradient(ellipse 40% 40% at 30% 80%,rgba(123,97,255,.08) 0%,transparent 60%)" } as React.CSSProperties} />
        <div style={{
          position: "relative", width: "100%", maxWidth: 1240, margin: "0 auto",
          display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 40,
        } as React.CSSProperties}>
          <div style={{ flex: "1 1 300px", maxWidth: 680, animation: "fadeUp 1s ease both" } as React.CSSProperties}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,229,255,.08)", border: "1px solid rgba(0,229,255,.2)", borderRadius: 2, padding: "6px 14px", fontFamily: "'Space Mono',monospace", fontSize: 11, color: "var(--accent)", letterSpacing: "0.12em", marginBottom: 32 } as React.CSSProperties}>
              <span style={{ width: 6, height: 6, background: "var(--accent)", borderRadius: "50%", animation: "pulse 2s infinite", flexShrink: 0 } as React.CSSProperties} />
              AI Product Manager · 求职中
            </div>
            <h1 style={{ fontFamily: "'Noto Serif SC',serif", fontSize: "clamp(42px,6vw,72px)", fontWeight: 300, lineHeight: 1.15, marginBottom: 24 } as React.CSSProperties}>
              用 <span style={{ color: "var(--accent)" } as React.CSSProperties}>AI 工具链</span><br />
              驱动<span style={{ background: "linear-gradient(135deg,var(--accent2),var(--accent))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" } as React.CSSProperties}>业务增长</span>
            </h1>
            <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.8, maxWidth: 520, marginBottom: 48 } as React.CSSProperties}>
              2年电商AI产品经验，主导多个百万级降本项目。<br />
              深耕 RPA+LLM 融合场景，兼具运营策略与产品落地双视角，<br />
              正在寻找下一个<strong style={{ color: "var(--text)" } as React.CSSProperties}> AI 笔记 / 知识库</strong>方向的产品机会。
            </p>
            <div style={{ display: "flex", gap: 40, marginBottom: 48, flexWrap: "wrap" } as React.CSSProperties}>
              {[["150W+","年化降本"],["95%","客户满意度"],["64","主导交付应用"],["80%","月活提升"]].map(([n,l])=>(
                <div key={l}><div style={{ fontFamily:"'Space Mono',monospace", fontSize:28, color:"var(--accent)", fontWeight:700, lineHeight:1 } as React.CSSProperties}>{n}</div><div style={{ fontSize:12, color:"var(--text-dim)", marginTop:4 } as React.CSSProperties}>{l}</div></div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" } as React.CSSProperties}>
              {[
                { label:"查看岗位匹配度", primary:true, href:"#match" },
                { label:"JD理解 →", primary:false, href:"#jd" },
                { label:"我用过 AI 笔记 →", primary:false, href:"#nblm", accent:true },
              ].map(({label,primary,href,accent})=>(
                <a key={label} href={href} style={{
                  background: primary?"var(--accent)":"transparent",
                  color: primary?"var(--bg)": accent?"#a898ff":"var(--text)",
                  border: primary?"none": accent?"1px solid rgba(123,97,255,.35)":"1px solid rgba(255,255,255,.15)",
                  padding:"14px 32px", fontFamily:"'Noto Sans SC',sans-serif", fontSize:14, fontWeight:primary?500:300,
                  cursor:"pointer", borderRadius:2, textDecoration:"none", display:"inline-flex", alignItems:"center",
                  transition:"all .3s",
                } as React.CSSProperties}>{label}</a>
              ))}
            </div>
          </div>

          {/* 数字团队 · 工具拟人化卡片 */}
          <div style={{
            flex: "1 1 260px", maxWidth: 400, width: "100%",
            animation: "fadeUp 1s ease 0.12s both",
          } as React.CSSProperties}>
            <div style={{
              fontFamily: "'Space Mono',monospace", fontSize: 10, color: "var(--accent)", letterSpacing: "0.14em",
              textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 10,
            } as React.CSSProperties}>
              <span style={{ width: 4, height: 4, background: "var(--accent2)", borderRadius: 1, flexShrink: 0 } as React.CSSProperties} />
              Digital Team · 数字团队
            </div>
            <p style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 14, maxWidth: 360 } as React.CSSProperties}>
              本页由一条 AI 工具链协作完成——把每个工具当作团队角色，与你快速对齐「谁在做什么」。
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
                      padding: "12px 12px 14px",
                      borderRadius: 10,
                      background: "linear-gradient(165deg, rgba(14,16,24,.96) 0%, rgba(8,10,18,.92) 100%)",
                      border: `1px solid ${border}`,
                      boxShadow: `0 0 0 1px ${glow}, 0 10px 36px rgba(0,0,0,.35)`,
                      overflow: "hidden",
                    } as React.CSSProperties}
                  >
                    <div style={{
                      position: "absolute", top: 0, right: 0, width: 56, height: 56,
                      background: `radial-gradient(circle at 100% 0%, ${glow}, transparent 70%)`,
                      pointerEvents: "none",
                    } as React.CSSProperties} />
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.1em" } as React.CSSProperties}>
                      MEMBER · {String(i + 1).padStart(2, "0")}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", marginTop: 6, lineHeight: 1.35 } as React.CSSProperties}>
                      {m.role}
                    </div>
                    <div style={{
                      display: "inline-block", marginTop: 8,
                      fontFamily: "'Space Mono',monospace", fontSize: 10, fontWeight: 600,
                      padding: "3px 9px", borderRadius: 4,
                      background: tagBg, border: `1px solid ${border}`, color: tagColor, letterSpacing: "0.06em",
                    } as React.CSSProperties}>
                      {m.tool}
                    </div>
                    <p style={{
                      margin: "10px 0 0", fontSize: 11, lineHeight: 1.65, color: "var(--text-dim)",
                    } as React.CSSProperties}>
                      {m.duty}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── EXPERIENCE & MATCH ── */}
      <section id="match" style={{ ...s.section, background: "var(--surface)", borderTop: "1px solid var(--border)" } as React.CSSProperties}>
        <div style={s.sectionLabel}>EXPERIENCE &amp; MATCH <span style={{ flex:1, height:1, background:"var(--border)", maxWidth:80 } as React.CSSProperties} /></div>
        <h2 style={s.sectionTitle}>我的经历 &amp; 与阿里 AI 笔记岗位的匹配度</h2>
        <p style={s.sectionDesc}>两段 AI 产品经历构成匹配度评估的基础——先了解我做过什么，再看与 JD 的对应程度。</p>

        {/* Inline timeline */}
        <div style={{ border:"1px solid var(--border)", overflow:"hidden", marginBottom:40 } as React.CSSProperties}>
          {[
            { company:"乐麦信息技术（杭州）", period:"2025.05 — 至今", role:"低代码平台产品负责人 + AI 交付产品经理",
              tags:["AI辅助XPath元素捕获 · 定位成功率+80%","自然语言指令搭建 · 搭建时间↓50%","交付64个应用 · 满意度95%","任务丢失率降低100%"] },
            { company:"杭州分叉科技", period:"2024.07 — 2025.04", role:"SaaS+MaaS 平台运营",
              tags:["LLMOps竞品分析 · 指导核心功能规划","100+工作流模板 · 月活提升80%","头部客户年化降本150W+","千牛对话系统 · 准确率91% · 日处理3000+"] },
          ].map((item,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"stretch", background:"var(--bg)", borderBottom:i===0?"1px solid var(--border)":"none" } as React.CSSProperties}>
              <div style={{ width:56, flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", paddingTop:28, position:"relative" } as React.CSSProperties}>
                <div style={{ width:10, height:10, border:"2px solid var(--accent)", borderRadius:"50%", background:"var(--bg)", boxShadow:"0 0 10px rgba(0,229,255,.4)" } as React.CSSProperties} />
                {i===0&&<div style={{ width:1, flex:1, background:"var(--border)", marginTop:6 } as React.CSSProperties} />}
              </div>
              <div style={{ flex:1, padding:"24px 32px 24px 0" } as React.CSSProperties}>
                <div style={{ display:"flex", alignItems:"center", flexWrap:"wrap", gap:"10px 16px", marginBottom:14 } as React.CSSProperties}>
                  <span style={{ fontFamily:"'Space Mono',monospace", fontSize:12, color:"var(--accent)", letterSpacing:".08em" } as React.CSSProperties}>{item.company}</span>
                  <span style={{ fontSize:12, color:"var(--text-dim)" } as React.CSSProperties}>{item.period}</span>
                  <span style={{ fontSize:14, fontWeight:500, width:"100%" } as React.CSSProperties}>{item.role}</span>
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:7 } as React.CSSProperties}>
                  {item.tags.map(t=>(
                    <span key={t} style={{ background:"rgba(0,229,255,.05)", border:"1px solid rgba(0,229,255,.14)", color:"var(--text-dim)", fontSize:12, padding:"4px 11px", borderRadius:2 } as React.CSSProperties}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ display:"flex", alignItems:"center", gap:16, margin:"40px 0 32px" } as React.CSSProperties}>
          <div style={{ flex:1, height:1, background:"var(--border)" } as React.CSSProperties} />
          <span style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"var(--text-dim)", letterSpacing:".1em", whiteSpace:"nowrap" } as React.CSSProperties}>基于以上经历，逐项对照 JD 要求 · 点击维度查看项目佐证</span>
          <div style={{ flex:1, height:1, background:"var(--border)" } as React.CSSProperties} />
        </div>

        {/* Match grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:60, alignItems:"start" } as React.CSSProperties}>
          {/* SVG Radar */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:20 } as React.CSSProperties}>
            <svg viewBox="0 0 260 260" width="260" height="260">
              <defs><linearGradient id="rg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#7b61ff" stopOpacity="0.7"/><stop offset="100%" stopColor="#00e5ff" stopOpacity="0.7"/></linearGradient></defs>
              <polygon points="130,50 196,80 196,180 130,210 64,180 64,80" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
              <polygon points="130,70 181,95 181,165 130,190 79,165 79,95" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
              <polygon points="130,90 166,110 166,150 130,170 94,150 94,110" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
              <line x1="130" y1="130" x2="130" y2="50" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
              <line x1="130" y1="130" x2="196" y2="80" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
              <line x1="130" y1="130" x2="196" y2="180" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
              <line x1="130" y1="130" x2="130" y2="210" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
              <line x1="130" y1="130" x2="64" y2="180" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
              <line x1="130" y1="130" x2="64" y2="80" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
              <polygon points="130,68 183,98 183,162 130,192 77,162 77,98" fill="rgba(123,97,255,0.06)" stroke="rgba(123,97,255,0.3)" strokeWidth="1.5" strokeDasharray="4,3"/>
              <polygon points="130,58 189,86 189,163 130,196 71,166 71,89" fill="rgba(0,229,255,0.12)" stroke="url(#rg1)" strokeWidth="2"/>
              {[[130,58],[189,86],[189,163],[130,196],[71,166],[71,89]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="4" fill="#00e5ff"/>)}
              <text x="130" y="42" textAnchor="middle" fill="#7a8090" fontSize="10" fontFamily="Space Mono,monospace">技术理解</text>
              <text x="210" y="78" textAnchor="start" fill="#7a8090" fontSize="10" fontFamily="Space Mono,monospace">产品设计</text>
              <text x="210" y="188" textAnchor="start" fill="#7a8090" fontSize="10" fontFamily="Space Mono,monospace">工程落地</text>
              <text x="130" y="226" textAnchor="middle" fill="#7a8090" fontSize="10" fontFamily="Space Mono,monospace">商业感知</text>
              <text x="50" y="188" textAnchor="end" fill="#7a8090" fontSize="10" fontFamily="Space Mono,monospace">用户洞察</text>
              <text x="50" y="78" textAnchor="end" fill="#7a8090" fontSize="10" fontFamily="Space Mono,monospace">协作推进</text>
              <line x1="20" y1="245" x2="40" y2="245" stroke="#00e5ff" strokeWidth="2"/>
              <circle cx="30" cy="245" r="3" fill="#00e5ff"/>
              <text x="44" y="249" fill="#7a8090" fontSize="9" fontFamily="Space Mono,monospace">我的水平</text>
              <line x1="120" y1="245" x2="140" y2="245" stroke="rgba(123,97,255,0.5)" strokeWidth="1.5" strokeDasharray="4,3"/>
              <text x="144" y="249" fill="#7a8090" fontSize="9" fontFamily="Space Mono,monospace">JD基准</text>
            </svg>
          </div>

          {/* Bars */}
          <div style={{ display:"flex", flexDirection:"column", gap:20 } as React.CSSProperties}>
            {BARS.map(bar=>(
              <div key={bar.key} onClick={()=>setPopupKey(bar.key)} style={{ cursor:"pointer" }}
                onMouseEnter={e=>(e.currentTarget.querySelector("[data-name]") as HTMLElement).style.color="var(--accent)"}
                onMouseLeave={e=>(e.currentTarget.querySelector("[data-name]") as HTMLElement).style.color="var(--text)"}
              >
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 } as React.CSSProperties}>
                  <span data-name="" style={{ fontSize:14, color:"var(--text)", transition:"color .2s" } as React.CSSProperties}>{bar.label}</span>
                  <span style={{ fontFamily:"'Space Mono',monospace", fontSize:13, color:"var(--accent)" } as React.CSSProperties}>{bar.pct}%</span>
                </div>
                <div style={{ height:4, background:"rgba(255,255,255,.06)", borderRadius:2, overflow:"hidden" } as React.CSSProperties}>
                  <div className={bar.cls} style={{ height:"100%", borderRadius:2, background:"linear-gradient(90deg,var(--accent2),var(--accent))" } as React.CSSProperties} />
                </div>
                <div style={{ fontSize:10, color:"transparent", fontFamily:"'Space Mono',monospace", marginTop:4, transition:"color .2s" }}
                  onMouseEnter={e=>(e.currentTarget.style.color="var(--accent)")}
                  onMouseLeave={e=>(e.currentTarget.style.color="transparent")}
                >点击查看项目佐证 →</div>
              </div>
            ))}
          </div>
        </div>

        {/* Project triggers */}
        {[
          { onClick:()=>navigate("project"), tag:"PROJECT 01 · 点击查看 STAR 法则深度拆解 →", title:"千牛电商客服全托管对话系统", sub:"影刀 RPA · 2024.07 — 2025.01", metrics:[["91%","多轮会话准确率"],["60%","人工干预减少"],["27%","转化率提升（AB测试）"],["3000+","日均处理咨询"]], accent:"var(--accent)", border:"var(--border)" },
          { onClick:()=>navigate("project2"), tag:"PROJECT 02 · 点击查看 STAR 法则深度拆解 →", title:"飞棋 RPA 工具全链路 AI 能力升级", sub:"乐麦信息技术 · 2025.05 — 2026.03", metrics:[["80%","XPath定位成功率提升"],["50%","流程搭建时间缩短"],["100%","任务丢失率降低"],["1h","故障恢复时间"]], accent:"#7b61ff", border:"rgba(123,97,255,.2)" },
        ].map((pt,i)=>(
          <div key={i} onClick={pt.onClick} style={{ marginTop:i===0?60:2, background:"var(--surface2)", border:`1px solid ${pt.border}`, borderRadius:2, padding:"32px 36px", display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer", transition:"all .3s", position:"relative", overflow:"hidden" } as React.CSSProperties}>
            <div style={{ position:"absolute", top:0, left:0, bottom:0, width:3, background:`linear-gradient(to bottom,var(--accent2),${pt.accent})` } as React.CSSProperties} />
            <div>
              <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:pt.accent, letterSpacing:".12em", marginBottom:8 } as React.CSSProperties}>{pt.tag}</div>
              <div style={{ fontSize:18, fontWeight:500, marginBottom:6 } as React.CSSProperties}>{pt.title}</div>
              <div style={{ fontSize:13, color:"var(--text-dim)", marginBottom:16 } as React.CSSProperties}>{pt.sub}</div>
              <div style={{ display:"flex", gap:24 } as React.CSSProperties}>
                {pt.metrics.map(([n,l])=>(
                  <div key={l}><div style={{ fontFamily:"'Space Mono',monospace", fontSize:20, color:pt.accent, fontWeight:700 } as React.CSSProperties}>{n}</div><div style={{ fontSize:11, color:"var(--text-dim)", marginTop:2 } as React.CSSProperties}>{l}</div></div>
                ))}
              </div>
            </div>
            <div style={{ width:48, height:48, border:`1px solid ${pt.border}`, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", color:pt.accent, fontSize:20, flexShrink:0 } as React.CSSProperties}>→</div>
          </div>
        ))}
      </section>

      {/* ── JD UNDERSTANDING ── */}
      <section id="jd" style={s.section}>
        <div style={s.sectionLabel}>JD UNDERSTANDING <span style={{ flex:1, height:1, background:"var(--border)", maxWidth:80 } as React.CSSProperties} /></div>
        <h2 style={s.sectionTitle}>我对 AI 笔记岗位的理解</h2>
        <p style={s.sectionDesc}>结合 JD 描述与行业洞察，拆解这个岗位的核心价值与难点所在。</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:2, marginBottom:60 } as React.CSSProperties}>
          {[
            { icon:"🧠", title:"本质：从「工具」到「助理」的范式跃迁", text:"笔记不再是静态记录容器，而是会主动理解、连接、推理的知识伙伴。类NotebookLM的个人知识库逻辑，核心是让AI真正理解用户的私域上下文。", evidence:'← 千牛项目本质也是"让AI读懂上下文替人工作"的同类实践' },
            { icon:"⚡", title:"难点：RAG召回质量vs用户体验的平衡", text:"知识库的核心挑战是「召回精不精、生成准不准、交互流不流」，任何一环出问题都会让用户放弃。产品经理需要深度懂技术链路才能设计合理功能边界。", evidence:"← 我设计过三级知识体系（标准层/扩展层/应急层）与踩踏闭环机制" },
            { icon:"🎯", title:"关键：C端习惯养成是最大护城河", text:"AI笔记的留存核心不是功能，而是让用户形成「记录→AI整理→获得洞察」的正向循环。这比B端工具更难，因为动机更弱、场景更碎片。", evidence:"← 用户分层运营经验，应用市场月活提升80%，深知习惯养成路径" },
          ].map(card=>(
            <div key={card.title} style={{ background:"var(--surface)", padding:"36px 32px", position:"relative", overflow:"hidden", transition:"background .3s" }}
              onMouseEnter={e=>{ (e.currentTarget.style.background="var(--surface2)"); }
              } onMouseLeave={e=>{ (e.currentTarget.style.background="var(--surface)"); }}>
              <span style={{ fontSize:28, marginBottom:20, display:"block" } as React.CSSProperties}>{card.icon}</span>
              <div style={{ fontSize:16, fontWeight:500, marginBottom:12 } as React.CSSProperties}>{card.title}</div>
              <div style={{ fontSize:13, color:"var(--text-dim)", lineHeight:1.8, marginBottom:16 } as React.CSSProperties}>{card.text}</div>
              <div style={{ padding:12, background:"rgba(0,229,255,.05)", borderLeft:"2px solid var(--accent)", fontSize:12, color:"var(--accent)", lineHeight:1.6, fontFamily:"'Space Mono',monospace" } as React.CSSProperties}>{card.evidence}</div>
            </div>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:2 } as React.CSSProperties}>
          {[
            { num:"01", title:"为什么阿里要做AI笔记？", jd:'"融合类NotebookLM个人知识库逻辑，将笔记从单纯记录工具升级为个人知识AI助理"', insight:"阿里的核心优势是<strong>海量用户数据+云端算力+阿里云AI服务</strong>。AI笔记是绝佳的私域数据入口——用户把最重要的知识存进来，AI越用越懂你，形成强粘性。" },
            { num:"02", title:"0→1的产品设计应该先做什么？", jd:'"进来的同学可以负责从0到1的产品设计，有充足的token资源投入"', insight:'第一步锁定<strong>高价值、强刚需</strong>的核心用户场景，拒绝大而全。以<strong>「长上下文+多文档联合分析」</strong>为技术壁垒，打透一个MVP场景验证留存，再逐步拓展。充足token不是"做更多功能"的理由，而是做竞品无法复制的体验深度的机会。' },
            { num:"03", title:"我会如何衡量这个产品的成功？", jd:'"希望帮助每一个C端用户使用最新AI能力"', insight:'核心指标不是DAU，而是<strong>"AI调用率×用户满意率×7日回流率"</strong>的组合。三个指标能真实反映AI助理是否已成为用户工作流的一部分。' },
            { num:"04", title:"我能带来什么独特价值？", jd:'"1-3年AI产品经理经验"', insight:"我不只是「懂AI」，而是<strong>亲手做过AI产品从需求到交付再到数据复盘的全链路</strong>。设计过知识库三级结构，做过RAG场景意图分析，做过AB测试验证模型效果。" },
          ].map(card=>(
            <div key={card.num} style={{ padding:"40px 36px", background:"var(--bg)", transition:"background .3s" }}
              onMouseEnter={e=>(e.currentTarget.style.background="#0e1016")}
              onMouseLeave={e=>(e.currentTarget.style.background="var(--bg)")}>
              <div style={{ fontFamily:"'Space Mono',monospace", fontSize:48, fontWeight:700, color:"rgba(0,229,255,.1)", lineHeight:1, marginBottom:16 } as React.CSSProperties}>{card.num}</div>
              <div style={{ fontSize:18, fontWeight:500, marginBottom:12 } as React.CSSProperties}>{card.title}</div>
              <div style={{ fontSize:13, color:"var(--text-dim)", lineHeight:1.7, marginBottom:16, padding:12, border:"1px solid rgba(255,255,255,.06)", borderRadius:2 } as React.CSSProperties}>
                <div style={{ fontSize:10, color:"var(--text-dim)", letterSpacing:".12em", marginBottom:6, fontFamily:"'Space Mono',monospace" } as React.CSSProperties}>JD 信号</div>
                {card.jd}
              </div>
              <div style={{ fontSize:14, color:"var(--text)", lineHeight:1.7 }} dangerouslySetInnerHTML={{ __html: card.insight }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── USER PERSPECTIVE (NBLM) ── */}
      <section id="nblm" style={{ ...s.section, background: "var(--surface)", borderTop: "1px solid var(--border)" } as React.CSSProperties}>
        <div style={s.sectionLabel}>USER PERSPECTIVE <span style={{ flex: 1, height: 1, background: "var(--border)", maxWidth: 80 } as React.CSSProperties} /></div>
        <h2 style={s.sectionTitle}>我用过 AI 笔记，也有话说</h2>
        <p style={s.sectionDesc}>用户视角+PM视角双重叠加——两个真实使用案例，以及作为重度用户对产品演化方向的判断。</p>

        {/* Cases */}
        <div style={{ display:"flex", flexDirection:"column", gap:2, marginBottom:2 } as React.CSSProperties}>
          {[
            { num:"案例 01", badge:"替代市面上缺失的工具", title:"用NotebookLM微调Prompt",
              painLabel:"🔍 发现的痛点", pain:"市面上没有好用的Prompt微调工具。写完prompt之后很难系统性迭代——不知道哪里出了问题，也没有结构化的方式去对比版本差异。",
              steps:["把「输入」「输出结果」「我写的Prompt」三者一起喂给NotebookLM","让它基于三者关系，分析Prompt哪里表达不精准、哪里有歧义","迭代修改后，把新一轮三元组再喂进去，形成持续优化闭环"],
              insightLabel:"📌 产品洞察", insight:"用户会把AI工具用在产品设计者没想到的地方。这个用法的本质是「把输入输出作为上下文，让AI帮我理解自己的思维漏洞」——这正是AI笔记最有价值的能力形态之一：让AI读懂我的上下文，然后反哺我自己。",
              link:"https://notebooklm.google.com/notebook/0a21f5bf-b7ef-4f7d-8e65-d5bd7a89e7c6", linkLabel:"Prompt微调实践记录" },
            { num:"案例 02", badge:"多文档联合分析的极致场景", title:"用NotebookLM打磨视频口播稿",
              painLabel:"🔍 面对的挑战", pain:"写视频口播稿需要同时满足三个约束：内容有价值、风格有吸引力、不踩平台规则和算法机制。这三个约束很难在脑子里同时处理。",
              steps:["用插件 YouTube to NotebookLM，把同领域优秀创作者的视频内容导入","同时喂入「平台社区公约」和「流量算法机制文档」作为约束边界","把第一版口播稿喂进去，让NotebookLM结合所有材料打磨，输出终稿"],
              insightLabel:"📌 产品洞察", insight:"这个场景体现了AI笔记最强的差异化能力：多文档联合分析+约束感知生成。用户不只是「问AI问题」，而是把AI构建成「懂我的领域、懂平台规则、懂我风格」的协作者——这正是相比普通AI对话工具的核心壁垒。",
              link:"https://notebooklm.google.com/notebook/4b8df186-c59a-4be0-9d4b-0a138ae02d05", linkLabel:"口播稿创作工作流" },
          ].map((c,i)=>(
            <div key={i} style={{ background:"var(--bg)", border:"1px solid var(--border)", overflow:"hidden" } as React.CSSProperties}>
              <div style={{ padding:"28px 36px 24px", borderBottom:"1px solid var(--border)", background:"rgba(255,255,255,.015)", display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" } as React.CSSProperties}>
                <span style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"var(--accent)", letterSpacing:".15em" } as React.CSSProperties}>{c.num}</span>
                <span style={{ background:"rgba(123,97,255,.1)", border:"1px solid rgba(123,97,255,.25)", color:"#a898ff", fontSize:11, padding:"3px 10px", borderRadius:2 } as React.CSSProperties}>{c.badge}</span>
                <div style={{ width:"100%", fontFamily:"'Noto Serif SC',serif", fontSize:22, fontWeight:400 } as React.CSSProperties}>{c.title}</div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr" } as React.CSSProperties}>
                <div style={{ padding:"32px 36px", borderRight:"1px solid var(--border)", display:"flex", flexDirection:"column", gap:20 } as React.CSSProperties}>
                  <div style={{ background:"rgba(255,107,107,.04)", borderLeft:"2px solid rgba(255,107,107,.4)", padding:"20px 22px", borderRadius:"0 2px 2px 0" } as React.CSSProperties}>
                    <div style={{ fontSize:12, color:"var(--text-dim)", marginBottom:10, fontWeight:500 } as React.CSSProperties}>{c.painLabel}</div>
                    <div style={{ fontSize:13, color:"var(--text-dim)", lineHeight:1.8 } as React.CSSProperties}>{c.pain}</div>
                  </div>
                  <div style={{ background:"rgba(0,229,255,.03)", borderLeft:"2px solid rgba(0,229,255,.3)", padding:"20px 22px", borderRadius:"0 2px 2px 0" } as React.CSSProperties}>
                    <div style={{ fontSize:12, color:"var(--text-dim)", marginBottom:12, fontWeight:500 } as React.CSSProperties}>💡 我的用法</div>
                    <div style={{ display:"flex", flexDirection:"column", gap:10 } as React.CSSProperties}>
                      {c.steps.map((step,si)=>(
                        <div key={si} style={{ display:"flex", alignItems:"flex-start", gap:12, fontSize:13, color:"var(--text-dim)", lineHeight:1.6 } as React.CSSProperties}>
                          <div style={{ width:22, height:22, borderRadius:"50%", background:"rgba(0,229,255,.08)", border:"1px solid rgba(0,229,255,.2)", color:"var(--accent)", fontFamily:"'Space Mono',monospace", fontSize:11, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 } as React.CSSProperties}>{si+1}</div>
                          <div>{step}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ padding:"32px 36px", display:"flex", flexDirection:"column", gap:20, justifyContent:"space-between" } as React.CSSProperties}>
                  <div style={{ background:"rgba(123,97,255,.05)", borderLeft:"2px solid rgba(123,97,255,.4)", padding:"20px 22px", borderRadius:"0 2px 2px 0", flex:1 } as React.CSSProperties}>
                    <div style={{ fontSize:12, color:"var(--text-dim)", marginBottom:10, fontWeight:500 } as React.CSSProperties}>{c.insightLabel}</div>
                    <div style={{ fontSize:13, color:"var(--text-dim)", lineHeight:1.8 } as React.CSSProperties}>{c.insight}</div>
                  </div>
                  <a href={c.link} target="_blank" rel="noopener noreferrer" style={{ display:"flex", alignItems:"center", gap:14, background:"var(--surface)", border:"1px solid var(--border)", padding:"16px 20px", borderRadius:2, textDecoration:"none", color:"var(--text)", transition:"all .3s" }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor="var(--accent)"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor="var(--border)"; }}>
                    <span style={{ fontSize:24, flexShrink:0 } as React.CSSProperties}>📒</span>
                    <div><div style={{ fontSize:14, fontWeight:500 } as React.CSSProperties}>查看我的 Notebook</div><div style={{ fontSize:12, color:"var(--accent)", fontFamily:"'Space Mono',monospace", marginTop:3 } as React.CSSProperties}>{c.linkLabel} →</div></div>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Accordion opinions */}
        <div style={{ marginTop:2, background:"var(--bg)", border:"1px solid var(--border)", overflow:"hidden" } as React.CSSProperties}>
          <div style={{ padding:"40px 48px 36px", borderBottom:"1px solid var(--border)", background:"linear-gradient(135deg,rgba(123,97,255,.04) 0%,transparent 60%)" } as React.CSSProperties}>
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"var(--accent2)", letterSpacing:".15em", marginBottom:12 } as React.CSSProperties}>PRODUCT OPINION · 用户+PM 双视角</div>
            <div style={{ fontFamily:"'Noto Serif SC',serif", fontSize:26, fontWeight:300, marginBottom:14 } as React.CSSProperties}>我对 AI 笔记的看法 &amp; 迭代建议</div>
            <div style={{ fontSize:14, color:"var(--text-dim)", lineHeight:1.8, maxWidth:640 } as React.CSSProperties}>NotebookLM已经可以连接网络，这是很大的进步。但作为重度用户，我清晰感知到三个结构性缺口——它们分别卡在「资源边界」「知识积累」「交互模式」三个层次。</div>
          </div>
          {ACC_ITEMS.map(item=>(
            <div key={item.id} style={{ borderBottom:"1px solid var(--border)" } as React.CSSProperties}>
              <div onClick={()=>setOpenAcc(openAcc===item.id?null:item.id)} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"28px 48px", cursor:"pointer", gap:20 }}
                onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,.02)")}
                onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                <div style={{ flex:1 } as React.CSSProperties}>
                  <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:openAcc===item.id?"var(--accent)":"var(--accent)", letterSpacing:".15em", marginBottom:6 } as React.CSSProperties}>{item.num}</div>
                  <div style={{ fontSize:17, fontWeight:500, marginBottom:4 } as React.CSSProperties}>{item.title}</div>
                  <div style={{ fontSize:13, color:"var(--text-dim)", lineHeight:1.5 } as React.CSSProperties}>{item.tagline}</div>
                </div>
                <div style={{ width:32, height:32, border:`1px solid ${openAcc===item.id?"var(--accent)":"var(--border)"}`, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", color:openAcc===item.id?"var(--accent)":"var(--text-dim)", fontSize:12, flexShrink:0, transform:openAcc===item.id?"rotate(180deg)":"none", transition:"all .3s" } as React.CSSProperties}>▾</div>
              </div>
              {openAcc===item.id&&(
                <div style={{ padding:"0 48px 32px" } as React.CSSProperties}>
                  <div style={{ background:"rgba(255,107,107,.03)", borderLeft:"2px solid rgba(255,107,107,.35)", padding:"16px 20px", borderRadius:"0 2px 2px 0", marginBottom:16 } as React.CSSProperties}>
                    <div style={{ fontSize:11, color:"#ff9090", fontFamily:"'Space Mono',monospace", letterSpacing:".08em", marginBottom:8 } as React.CSSProperties}>当前缺口</div>
                    <div style={{ fontSize:13, color:"var(--text-dim)", lineHeight:1.8 } as React.CSSProperties}>{item.gap}</div>
                  </div>
                  <div style={{ background:"rgba(0,229,255,.03)", borderLeft:"2px solid rgba(0,229,255,.3)", padding:"16px 20px", borderRadius:"0 2px 2px 0", marginBottom:16 } as React.CSSProperties}>
                    <div style={{ fontSize:11, color:"var(--accent)", fontFamily:"'Space Mono',monospace", letterSpacing:".08em", marginBottom:8 } as React.CSSProperties}>建议方向</div>
                    <div style={{ fontSize:13, color:"var(--text-dim)", lineHeight:1.8 } as React.CSSProperties}>{item.suggestion}</div>
                  </div>
                  <div style={{ fontSize:12, color:"var(--text-dim)", display:"flex", alignItems:"flex-start", gap:8, padding:"10px 14px", background:"rgba(255,255,255,.02)", borderRadius:2 } as React.CSSProperties}>
                    <span style={{ color:"var(--accent2)", flexShrink:0 } as React.CSSProperties}>↗</span>{item.ref}
                  </div>
                </div>
              )}
            </div>
          ))}
          <div style={{ padding:"28px 48px", background:"rgba(123,97,255,.04)", borderTop:"1px solid var(--border)" } as React.CSSProperties}>
            <div style={{ fontSize:14, color:"var(--text-dim)", lineHeight:1.8 } as React.CSSProperties}>三个缺口对应三条演化路径：<strong style={{ color:"var(--accent)" } as React.CSSProperties}>资源边界更宽（连接器+MCP）→ 知识积累更深（PKM能力补足）→ 交互模式更主动（从被动回答到主动洞察）</strong>——AI笔记只有在这三个层次同时突破，才能从"对话框里的知识库"变成真正渗透进用户工作流的个人知识助理。</div>
          </div>
        </div>
      </section>

      {/* ── SKILLS ── */}
      <section id="skills" style={s.section}>
        <div style={s.sectionLabel}>SKILLS <span style={{ flex:1, height:1, background:"var(--border)", maxWidth:80 } as React.CSSProperties} /></div>
        <h2 style={s.sectionTitle}>技能图谱</h2>
        <p style={s.sectionDesc}>以 AI 产品能力为核心，辅以低代码、数据分析、工程沟通能力。</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:2 } as React.CSSProperties}>
          {[
            { name:"AI 产品能力", tags:[...RESUME_DATA.skills.ai], keys:["Prompt工程","RAG知识库","Agent工作流"] },
            { name:"低代码 / 自动化", tags:[...RESUME_DATA.skills.lowcode], keys:["飞棋RPA","影刀RPA"] },
            { name:"产品工具链", tags:[...RESUME_DATA.skills.product], keys:["Axure"] },
            { name:"跨职能协作", tags:["需求评审","前后端对接","测试用例设计","用户调研","数据分析","ROI测算"], keys:["需求评审","数据分析"] },
          ].map(cat=>(
            <div key={cat.name} style={{ background: "var(--surface)", padding: "32px 28px", transition: "background .3s" } as React.CSSProperties}
              onMouseEnter={e=>(e.currentTarget.style.background="var(--surface2)")}
              onMouseLeave={e=>(e.currentTarget.style.background="var(--surface)")}>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "var(--accent)", letterSpacing: ".15em", textTransform: "uppercase", marginBottom: 20 } as React.CSSProperties}>{cat.name}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 } as React.CSSProperties}>
                {cat.tags.map(t=>(
                  <span key={t} style={{ background: cat.keys.includes(t) ? "rgba(0,229,255,.06)" : "rgba(255,255,255,.04)", border: cat.keys.includes(t) ? "1px solid rgba(0,229,255,.3)" : "1px solid rgba(255,255,255,.08)", color: cat.keys.includes(t) ? "var(--accent)" : "var(--text-dim)", fontSize: 12, padding: "5px 12px", borderRadius: 2 } as React.CSSProperties}>{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding:"30px 60px", borderTop:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between", fontSize:12, color:"var(--text-dim)", fontFamily:"'Space Mono',monospace" } as React.CSSProperties}>
        <span>傅倩娇 · AI产品经理</span>
        <span>25岁 · 物联网工程学士 · 2年AI产品经验</span>
      </footer>

      {/* ── FAB (联系我) ── */}
      <div style={{ position:"fixed", bottom:32, right:110, zIndex:200, display:"flex", flexDirection:"column", alignItems:"flex-end", gap:10 } as React.CSSProperties}>
        {fabOpen&&(
          <div style={{ display:"flex", flexDirection:"column", gap:8, alignItems:"flex-end" } as React.CSSProperties}>
            {[
              { icon:"📄", label:"下载简历", href:RESUME_DATA.basic.resumeLink, target:"_blank" },
              { icon:"💬", label:`微信：${RESUME_DATA.basic.wechat}`, href:"#", onClick:()=>navigator.clipboard?.writeText(RESUME_DATA.basic.wechat) },
              { icon:"📧", label:RESUME_DATA.basic.email, href:`mailto:${RESUME_DATA.basic.email}` },
              ].map(item=>(
              <a key={item.label} href={item.href} target={item.target} onClick={item.onClick} style={{ display:"flex", alignItems:"center", gap:10, background:"var(--surface)", border:"1px solid var(--border)", padding:"10px 16px", borderRadius:24, color:"var(--text)", textDecoration:"none", fontSize:13, whiteSpace:"nowrap", boxShadow:"0 4px 16px rgba(0,0,0,.4)", transition:"all .2s" }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor="var(--accent)"; e.currentTarget.style.color="var(--accent)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.color="var(--text)"; }}>
                <span style={{ fontSize:15 } as React.CSSProperties}>{item.icon}</span>{item.label}
              </a>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={()=>setFabOpen(o=>!o)}
          style={{
            position:"relative", padding:0, border:"none", cursor:"pointer",
            background:"transparent", fontFamily:"'Noto Sans SC',sans-serif",
          } as React.CSSProperties}
          onMouseEnter={e=>{
            const ring = e.currentTarget.querySelector("[data-fab-cyber-ring]") as HTMLElement | null;
            const inner = e.currentTarget.querySelector("[data-fab-cyber-inner]") as HTMLElement | null;
            if (ring) ring.style.boxShadow = "0 0 22px rgba(0,229,255,.55), 0 0 44px rgba(168,152,255,.35), 0 0 2px rgba(0,229,255,.8)";
            if (inner) inner.style.boxShadow = "inset 0 0 28px rgba(0,229,255,.08), inset 0 0 40px rgba(123,97,255,.1)";
          }}
          onMouseLeave={e=>{
            const ring = e.currentTarget.querySelector("[data-fab-cyber-ring]") as HTMLElement | null;
            const inner = e.currentTarget.querySelector("[data-fab-cyber-inner]") as HTMLElement | null;
            if (ring) ring.style.boxShadow = "0 0 14px rgba(0,229,255,.35), 0 0 28px rgba(123,97,255,.2)";
            if (inner) inner.style.boxShadow = "inset 0 0 24px rgba(123,97,255,.06)";
          }}
        >
          <span
            data-fab-cyber-ring
            style={{
              position:"relative", zIndex:1, display:"block", padding:1, borderRadius:14,
              background:"linear-gradient(120deg, #00e5ff 0%, #00b8d4 25%, #7b61ff 72%, #c084fc 100%)",
              boxShadow:"0 0 14px rgba(0,229,255,.35), 0 0 28px rgba(123,97,255,.2)",
              transition:"box-shadow .35s ease",
            } as React.CSSProperties}
          >
            <span
              data-fab-cyber-inner
              style={{
                display:"flex", alignItems:"center", gap:10, minHeight:46,
                padding:"0 22px 0 18px", borderRadius:13,
                background:"linear-gradient(165deg, rgba(12,14,22,.92) 0%, rgba(8,10,18,.88) 100%)",
                backdropFilter:"blur(14px)", WebkitBackdropFilter:"blur(14px)",
                border:"1px solid rgba(0,229,255,.18)",
                boxShadow:"inset 0 0 24px rgba(123,97,255,.06)",
                transition:"box-shadow .35s ease",
              } as React.CSSProperties}
            >
              {fabOpen ? (
                <span style={{
                  display:"flex", alignItems:"center", justifyContent:"center",
                  width:22, height:22, borderRadius:4,
                  border:"1px solid rgba(248,113,113,.45)",
                  color:"#fca5a5", fontSize:13, lineHeight:1,
                  boxShadow:"0 0 10px rgba(248,113,113,.25)",
                } as React.CSSProperties}>✕</span>
              ) : (
                <svg
                  className="fab-cyber-mail"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ flexShrink:0 } as React.CSSProperties}
                >
                  <path
                    d="M4 6.5h16v11H4V6.5zm0 0l8 5.25L20 6.5M4 17.5l6.5-4M20 17.5l-6.5-4"
                    stroke="#7df4ff"
                    strokeWidth="1.35"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              <span
                style={{
                  fontSize:14, fontWeight:500, letterSpacing:"0.08em",
                  background:"linear-gradient(92deg, #7df4ff 0%, #c4b5fd 48%, #e9d5ff 100%)",
                  WebkitBackgroundClip:"text", backgroundClip:"text",
                  color:"transparent",
                  textShadow:"0 0 18px rgba(0,229,255,.35)",
                  filter:"drop-shadow(0 0 8px rgba(0,229,255,.25))",
                } as React.CSSProperties}
              >
                {fabOpen ? "关闭" : "联系我"}
              </span>
            </span>
          </span>
        </button>
      </div>

      {/* ── Skill Popup ── */}
      {popup&&(
        <div onClick={()=>setPopupKey(null)} style={{ display:"flex", position:"fixed", inset:0, zIndex:300, background:"rgba(0,0,0,.7)", backdropFilter:"blur(8px)", alignItems:"center", justifyContent:"center", padding:24 } as React.CSSProperties}>
          <div onClick={e=>e.stopPropagation()} style={{ background:"var(--surface)", border:"1px solid var(--border)", maxWidth:560, width:"100%", maxHeight:"80vh", overflowY:"auto", borderRadius:4, boxShadow:"0 20px 60px rgba(0,0,0,.6)", animation:"fadeUp .25s ease" } as React.CSSProperties}>
            <div style={{ padding:"24px 28px 20px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"flex-start", justifyContent:"space-between", position:"sticky", top:0, background:"var(--surface)", zIndex:1 } as React.CSSProperties}>
              <div>
                <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"var(--accent)", letterSpacing:".12em", marginBottom:6 } as React.CSSProperties}>{popup.tag}</div>
                <div style={{ fontSize:18, fontWeight:500 } as React.CSSProperties}>{popup.title}</div>
              </div>
              <button onClick={()=>setPopupKey(null)} style={{ width:32, height:32, border:"1px solid var(--border)", background:"none", color:"var(--text-dim)", cursor:"pointer", borderRadius:"50%", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" } as React.CSSProperties}>✕</button>
            </div>
            <div style={{ padding:"24px 28px" } as React.CSSProperties}>
              {popup.evidences.map(ev=>(
                <div key={ev.label} style={{ marginBottom:16, padding:"14px 16px", background:"rgba(0,229,255,.05)", borderLeft:"2px solid var(--accent)" } as React.CSSProperties}>
                  <div style={{ fontSize:10, color:"var(--accent)", fontFamily:"'Space Mono',monospace", letterSpacing:".1em", marginBottom:6 } as React.CSSProperties}>{ev.label}</div>
                  <div style={{ fontSize:13, color:"var(--text-dim)", lineHeight:1.7 }} dangerouslySetInnerHTML={{ __html: ev.text }} />
                </div>
              ))}
              {popup.projects.map(p=>(
                <div key={p.name} onClick={()=>{ setPopupKey(null); navigate(p.page); }} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:2, cursor:"pointer", marginTop:12, transition:"all .2s" }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor="var(--accent)"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>
                  <div>
                    <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"var(--accent)", letterSpacing:".1em", marginBottom:4 } as React.CSSProperties}>{p.tag}</div>
                    <div style={{ fontSize:14, fontWeight:500 } as React.CSSProperties}>{p.name}</div>
                  </div>
                  <span style={{ color:"var(--accent)", fontSize:16 } as React.CSSProperties}>→</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
