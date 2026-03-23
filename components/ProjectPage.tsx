"use client";
// components/ProjectPage.tsx
// 千牛项目 STAR 详解页
import type { PageName } from "@/app/page";
import { useState } from "react";

interface Props { navigate: (page: PageName) => void; }
type Tab = "S" | "T" | "A" | "R";

const tabLabels: Record<Tab,string> = { S:"Situation · 背景", T:"Task · 任务", A:"Action · 行动", R:"Result · 结果" };

export default function ProjectPage({ navigate }: Props) {
  const [tab, setTab] = useState<Tab>("S");

  const base: React.CSSProperties = {
    fontFamily: "'Noto Sans SC', sans-serif",
    color: "var(--text)",
    background: "var(--bg)",
    minHeight: "100vh",
  };

  const tabBtn = (t: Tab): React.CSSProperties => ({
    padding: "18px 32px",
    fontFamily: "'Space Mono',monospace",
    fontSize: 11,
    letterSpacing: ".1em",
    color: tab===t ? "var(--accent)" : "var(--text-dim)",
    cursor: "pointer",
    borderBottom: `2px solid ${tab===t ? "var(--accent)" : "transparent"}`,
    border: "none",
    background: "none",
    display: "flex",
    alignItems: "center",
    gap: 10,
    transition: "all .3s",
  });

  const tabDot = (t: Tab): React.CSSProperties => ({
    width: 22, height: 22, borderRadius: "50%",
    background: tab===t ? "var(--accent)" : "rgba(0,229,255,.08)",
    color: tab===t ? "var(--bg)" : "var(--accent)",
    border: "1px solid rgba(0,229,255,.2)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 12, fontWeight: 700,
  });

  return (
    <div style={base}>
      {/* Hero */}
      <div style={{ padding: "80px 60px 60px", background: "var(--surface)", borderBottom: "1px solid var(--border)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 80% at 80% 50%,rgba(123,97,255,.07) 0%,transparent 70%)" }} />
        <button onClick={()=>navigate("main")} style={{ display:"inline-flex", alignItems:"center", gap:8, color:"var(--text-dim)", fontSize:13, cursor:"pointer", border:"none", background:"none", marginBottom:32, position:"relative", zIndex:10, padding:0, transition:"color .3s" }}
          onMouseEnter={e=>e.currentTarget.style.color="var(--accent)"}
          onMouseLeave={e=>e.currentTarget.style.color="var(--text-dim)"}>
          ← 返回主页
        </button>
        <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"var(--accent)", letterSpacing:".15em", marginBottom:16 }}>CORE PROJECT · STAR 法则深度拆解</div>
        <h1 style={{ fontFamily:"'Noto Serif SC',serif", fontSize:"clamp(28px,4vw,48px)", fontWeight:300, lineHeight:1.25, marginBottom:20 }}>千牛电商客服全托管对话系统</h1>
        <p style={{ fontSize:15, color:"var(--text-dim)", lineHeight:1.8, maxWidth:640, marginBottom:40 }}>基于上下文理解引擎搭建「语音识别→NLP意图解析→RPA工单分发」智能处理链路，将电商客服从人力密集型转型为智能自动化模式。</p>
        <div style={{ display:"flex", gap:40, flexWrap:"wrap" }}>
          {[["91%","多轮会话准确率"],["89%","意图识别准确率"],["60%","人工干预减少"],["27%","转化率提升（AB测试）"],["3000+","日均处理咨询"]].map(([n,l])=>(
            <div key={l}><div style={{ fontFamily:"'Space Mono',monospace", fontSize:32, fontWeight:700, color:"var(--accent)", lineHeight:1 }}>{n}</div><div style={{ fontSize:12, color:"var(--text-dim)", marginTop:4 }}>{l}</div></div>
          ))}
        </div>
      </div>

      {/* STAR Tabs */}
      <div style={{ position:"sticky", top:0, zIndex:50, background:"rgba(10,12,16,.95)", backdropFilter:"blur(20px)", borderBottom:"1px solid var(--border)", display:"flex" }}>
        {(["S","T","A","R"] as Tab[]).map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={tabBtn(t)}>
            <div style={tabDot(t)}>{t}</div>
            {tabLabels[t]}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "60px" }}>
        {tab === "S" && <SPanel />}
        {tab === "T" && <TPanel />}
        {tab === "A" && <APanel />}
        {tab === "R" && <RPanel navigate={navigate} />}
      </div>
    </div>
  );
}

function SPanel() {
  return (
    <div>
      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"var(--accent)", letterSpacing:".15em", marginBottom:16 }}>SITUATION</div>
      <h2 style={{ fontFamily:"'Noto Serif SC',serif", fontSize:"clamp(28px,4vw,42px)", fontWeight:300, lineHeight:1.3, marginBottom:16 }}>为什么要做这个项目？</h2>
      <p style={{ color:"var(--text-dim)", fontSize:15, lineHeight:1.8, maxWidth:560, marginBottom:60 }}>电商客服场景存在两类结构性矛盾，现有系统无法解决，必须重建。</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:2, marginBottom:48 }}>
        {[
          { color:"#ff6b6b", icon:"📈", title:"痛点一：弹性用人需求 vs 固定人力成本", text:"电商大促期间咨询量是日常的5~10倍，但大促结束后流量立刻回落。按峰值配置则平时90%时间人力浪费；按日常配置则大促期间完全扛不住，临时招聘+培训成本同样极高。", impact:'核心矛盾：弹性用人的业务需求与固定人力成本之间存在天然对立，无法靠"多招人"解决。' },
          { color:"#f0a040", icon:"🤖", title:"痛点二：千牛原生机器人能力边界", text:'千牛原生机器人只能做FAQ问答，是封闭系统，无法与企业内部OMS订单管理系统打通。用户问"我的退货处理到哪步了"，机器人查不到订单数据，只能给模糊答复或直接转人工。', impact:"结果：大量本可自动化处理的订单查询、退换货跟进全压到人工坐席，转人工率居高不下。" },
        ].map(card=>(
          <div key={card.title} style={{ background:"var(--surface)", padding:"36px 32px", borderLeft:`3px solid ${card.color}` }}>
            <span style={{ fontSize:32, marginBottom:16, display:"block" }}>{card.icon}</span>
            <div style={{ fontSize:16, fontWeight:500, marginBottom:12 }}>{card.title}</div>
            <div style={{ fontSize:13, color:"var(--text-dim)", lineHeight:1.8, marginBottom:16 }}>{card.text}</div>
            <div style={{ padding:"10px 14px", background:"rgba(255,255,255,.03)", fontSize:12, color:"var(--text-dim)" }}><strong style={{ color:"var(--text)" }}>核心矛盾：</strong>{card.impact}</div>
          </div>
        ))}
      </div>
      {/* Intent distribution */}
      <div style={{ background:"var(--surface)", padding:"28px 40px" }}>
        <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"var(--accent)", letterSpacing:".12em", marginBottom:16 }}>意图分布（改造前历史数据）</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:40 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[["物流查询","38%","var(--accent)"],["退换货咨询","24%","#7b61ff"],["促销咨询","19%","#f0a040"],["其他","19%","rgba(255,255,255,.15)"]].map(([l,p,c])=>(
              <div key={l}><div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}><span style={{ fontSize:13, color:"var(--text-dim)" }}>{l}</span><span style={{ fontFamily:"'Space Mono',monospace", fontSize:13, color:c as string }}>{p}</span></div><div style={{ height:3, background:"rgba(255,255,255,.05)", borderRadius:2 }}><div style={{ height:"100%", width:p, background:c as string, borderRadius:2 }} /></div></div>
            ))}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {[["41%","意图识别环节流失率（歧义问题）","#ff6b6b"],["5~10x","大促vs日常咨询量倍数","#f0a040"]].map(([n,l,c])=>(
              <div key={l}><div style={{ fontFamily:"'Space Mono',monospace", fontSize:28, color:c, fontWeight:700 }}>{n}</div><div style={{ fontSize:12, color:"var(--text-dim)", marginTop:2 }}>{l}</div></div>
            ))}
          </div>
          <div><div style={{ fontSize:13, color:"var(--text-dim)", lineHeight:1.9 }}>① 意图高度结构化，适合NLP<br/>② 操作可枚举，适合RPA<br/>③ 数据积累快，支持迭代<br/>④ ROI清晰，容易拿到资源</div></div>
        </div>
      </div>
    </div>
  );
}

function TPanel() {
  return (
    <div>
      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"var(--accent)", letterSpacing:".15em", marginBottom:16 }}>TASK</div>
      <h2 style={{ fontFamily:"'Noto Serif SC',serif", fontSize:"clamp(28px,4vw,42px)", fontWeight:300, lineHeight:1.3, marginBottom:16 }}>目标是什么？怎么制定的？</h2>
      <p style={{ color:"var(--text-dim)", fontSize:15, lineHeight:1.8, maxWidth:560, marginBottom:60 }}>三项核心指标，环环相扣，共同构成"让机器扛住大头"的目标体系。</p>
      <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
        {[
          { num:"01", title:"多轮会话准确率 ≥ 90%", desc:"电商客服的核心难点不是单轮问答，而是用户跨轮次表达同一个诉求。准确率不达标直接影响用户体验和投诉率，是最底层的质量门槛。", note:'行业对话系统准确率通常75~85%，90%是"用户感知不到是机器人"的体验水准。', target:"目标90% → 实际达成91%" },
          { num:"02", title:"日均处理咨询量3000+ & 人工干预减少60%", desc:'两个指标必须同时达成——不是把问题全推给人工，而是让机器人真正扛住大头。否则可能出现"量达到了但全靠转人工"的情况。', note:"两指标同步考核，缺一不可，才能真正反映自动化效果。", target:"目标3000+咨询 · 60%减少 → 均达成" },
          { num:"03", title:"自动处理率65%，实时人工介入控制15~20%", desc:"65%对应RPA能全自动闭环的标准问题；剩下35%进入人工相关流程，但大部分是异步复核而非实时接管。", note:"最终达成：机器人80%+ · 实时人工15~20%", target:"最终达成 → 机器人80%+ · 实时人工15~20%" },
        ].map(item=>(
          <div key={item.num} style={{ background:"var(--surface)", padding:"32px 36px", display:"flex", alignItems:"flex-start", gap:32 }}>
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:32, fontWeight:700, color:"rgba(0,229,255,.15)", lineHeight:1, flexShrink:0, width:48 }}>{item.num}</div>
            <div>
              <div style={{ fontSize:16, fontWeight:500, marginBottom:8 }}>{item.title}</div>
              <div style={{ fontSize:13, color:"var(--text-dim)", lineHeight:1.8, marginBottom:12 }}>{item.desc}</div>
              <div style={{ fontSize:13, color:"var(--text-dim)", marginBottom:16 }}><strong style={{ color:"var(--text)" }}>基准来源：</strong>{item.note}</div>
              <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(0,229,255,.06)", border:"1px solid rgba(0,229,255,.15)", padding:"6px 14px", fontFamily:"'Space Mono',monospace", fontSize:12, color:"var(--accent)" }}>{item.target}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function APanel() {
  return (
    <div>
      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"var(--accent)", letterSpacing:".15em", marginBottom:16 }}>ACTION</div>
      <h2 style={{ fontFamily:"'Noto Serif SC',serif", fontSize:"clamp(28px,4vw,42px)", fontWeight:300, lineHeight:1.3, marginBottom:16 }}>核心技术架构与落地决策</h2>
      <p style={{ color:"var(--text-dim)", fontSize:15, lineHeight:1.8, maxWidth:560, marginBottom:48 }}>三层串行架构，每层职责单一、输出结构化，问题可定位、模块可替换。</p>

      {/* Process diagram */}
      <div style={{ background:"var(--surface)", border:"1px solid var(--border)", padding:"28px 32px", borderRadius:2, marginBottom:48, display:"flex", alignItems:"center", justifyContent:"center", gap:0, flexWrap:"wrap", rowGap:12 }}>
        {["用户输入\nraw_input","问题优化专家\n上下文+元数据注入","知识库召回\n三层检索策略","回复专家\n生成+置信度判断","RPA执行/转人工\nfallback梯度路由"].map((node,i)=>(
          <>
            <div key={node} style={{ background:"var(--bg)", border:"1px solid var(--accent)", padding:"12px 18px", fontSize:13, color:"var(--accent)", textAlign:"center", minWidth:110, borderRadius:2 }}>
              {node.split("\n").map((line,li)=>(
                <div key={li} style={{ ...(li>0?{fontSize:11, color:"var(--text-dim)", marginTop:3}:{}) }}>{line}</div>
              ))}
            </div>
            {i<4&&<div key={`arrow${i}`} style={{ color:"rgba(0,229,255,.4)", fontSize:16, margin:"0 6px", flexShrink:0 }}>→</div>}
          </>
        ))}
      </div>

      {/* Layers */}
      <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
        {/* Layer 1 */}
        <div style={{ background:"var(--surface)", padding:"36px 40px", display:"grid", gridTemplateColumns:"180px 1fr", gap:40, alignItems:"start" }}>
          <div><div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"var(--accent)", letterSpacing:".15em", marginBottom:8 }}>LAYER 01</div><div style={{ fontSize:16, fontWeight:500 }}>问题优化专家</div></div>
          <div>
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"var(--text-dim)", letterSpacing:".08em", marginBottom:12, textTransform:"uppercase" }}>核心设计决策</div>
            <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
              {["为什么是近5轮历史？测试过3轮（上下文丢失率~18%）和7轮（token超限率~22%），5轮是精度与消耗的最优平衡点","元数据注入：将order_id/order_status/logistics_node直接注入prompt，解决模型靠猜给模糊答案的幻觉问题","intent字段双价值：① 数据统计指导知识库补充优先级；② 点踩=负样本、高满意度=正样本，持续微调训练数据"].map(item=>(
                <li key={item} style={{ fontSize:13, color:"var(--text-dim)", lineHeight:1.7, paddingLeft:16, position:"relative" }}>
                  <span style={{ position:"absolute", left:4, color:"var(--accent)", fontSize:16, lineHeight:1.3 }}>·</span>{item}
                </li>
              ))}
            </ul>
            {/* Fallback table */}
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead><tr>{["等级","触发条件","处理方式","实际占比"].map(h=><th key={h} style={{ fontFamily:"'Space Mono',monospace", fontSize:10, letterSpacing:".1em", color:"var(--text-dim)", textAlign:"left", padding:"8px 14px", borderBottom:"1px solid var(--border)" }}>{h}</th>)}</tr></thead>
              <tbody>{[["L0","改写成功，missing_info为null","继续走知识库检索","~78%"],["L1","信息缺失，missing_info不为null","向用户追问，中断等待补充","~17%"],["L2","输入混乱/纯表情/乱码","直接转人工，不进检索","~5%"]].map(row=><tr key={row[0]}>{row.map((cell,ci)=><td key={ci} style={{ fontSize:13, color:ci===0?"var(--accent)":"var(--text-dim)", padding:"10px 14px", borderBottom:"1px solid rgba(255,255,255,.04)" }}>{cell}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </div>

        {/* Layer 2 */}
        <div style={{ background:"var(--surface)", padding:"36px 40px", display:"grid", gridTemplateColumns:"180px 1fr", gap:40, alignItems:"start" }}>
          <div><div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"var(--accent)", letterSpacing:".15em", marginBottom:8 }}>LAYER 02</div><div style={{ fontSize:16, fontWeight:500 }}>知识库召回</div></div>
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:2 }}>
              {[{ cls:"#00e5ff", name:"STANDARD · 标准层", method:"向量检索", desc:"rewritten_query embedding后与知识库文档向量做相似度匹配，返回top3最相关文档片段。覆盖物流查询、常规退换货等高频标准问题。" },{ cls:"#7b61ff", name:"EXTENDED · 扩展层", method:"向量检索+关键词过滤", desc:"针对跨境退货关税计算、多商品部分退款、促销叠加冲突等复杂组合场景。关键词直接用OMS字段枚举值，避免翻译层维护脱节。" },{ cls:"#ff6b6b", name:"EMERGENCY · 应急层", method:"精确匹配（触发关键词）", desc:"敏感问题话术模板和客诉升级预警规则。命中后强制fallback_level=2转人工，不走自动化。宁可全转人工也不冒险。" }].map(l=>(
                <div key={l.name} style={{ padding:"28px 24px", borderTop:`3px solid ${l.cls}`, background:"rgba(255,255,255,.02)" }}>
                  <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, letterSpacing:".12em", marginBottom:12, color:l.cls }}>{l.name}</div>
                  <div style={{ fontSize:13, fontWeight:500, marginBottom:10 }}>{l.method}</div>
                  <div style={{ fontSize:12, color:"var(--text-dim)", lineHeight:1.7 }}>{l.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Layer 3 */}
        <div style={{ background:"var(--surface)", padding:"36px 40px", display:"grid", gridTemplateColumns:"180px 1fr", gap:40, alignItems:"start" }}>
          <div><div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"var(--accent)", letterSpacing:".15em", marginBottom:8 }}>LAYER 03</div><div style={{ fontSize:16, fontWeight:500 }}>回复专家</div></div>
          <div>
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"var(--text-dim)", letterSpacing:".08em", marginBottom:12, textTransform:"uppercase" }}>四级fallback兜底设计</div>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead><tr>{["等级","置信度条件","action","处理方式"].map(h=><th key={h} style={{ fontFamily:"'Space Mono',monospace", fontSize:10, letterSpacing:".1em", color:"var(--text-dim)", textAlign:"left", padding:"8px 14px", borderBottom:"1px solid var(--border)" }}>{h}</th>)}</tr></thead>
              <tbody>{[["L0","confidence ≥ 0.75","rpa_auto","RPA全自动回复用户"],["L1","0.6 ≤ c < 0.75","rpa_auto+复核","先自动回复，推入人工异步校验队列"],["L2","confidence < 0.6","transfer_human","打包上下文，路由给人工坐席实时接管"],["L3","30min内同类intent连续20+ L2","system_alert","飞书机器人自动预警运营"]].map(row=><tr key={row[0]}>{row.map((cell,ci)=><td key={ci} style={{ fontSize:13, color:ci===0?"var(--accent)":"var(--text-dim)", padding:"10px 14px", borderBottom:"1px solid rgba(255,255,255,.04)" }}>{cell}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function RPanel({ navigate }: { navigate: (p: PageName) => void }) {
  return (
    <div>
      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"var(--accent)", letterSpacing:".15em", marginBottom:16 }}>RESULT</div>
      <h2 style={{ fontFamily:"'Noto Serif SC',serif", fontSize:"clamp(28px,4vw,42px)", fontWeight:300, lineHeight:1.3, marginBottom:16 }}>最终达成了什么？</h2>
      <p style={{ color:"var(--text-dim)", fontSize:15, lineHeight:1.8, maxWidth:560, marginBottom:60 }}>所有核心指标达成，并通过AB测试验证了核心技术方向的选择。</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:2, marginBottom:48 }}>
        {[["91%","多轮会话准确率","超出目标值（90%），通过动态对话状态跟踪+近5轮历史+元数据注入实现。","目标90% → 实际91%"],["89%","意图识别准确率","通过BERT模型实现意图识别，将原先41%的歧义流失降至可控。","歧义流失从41%降至可控"],["3000+","日均处理咨询量","大促期间不需要临时扩充客服团队。OMS打通后退换货跟进全自动化。","弹性应对5~10x大促峰值"],["60%","人工干预减少","机器人处理80%+，人工实时接待15~20%，人工异步复核5%左右。","系统性指标，非单点优化"]].map(([n,l,d,t])=>(
          <div key={l} style={{ background:"var(--surface)", padding:"40px 36px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2, background:"linear-gradient(90deg,var(--accent2),var(--accent))" }} />
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:48, fontWeight:700, color:"var(--accent)", lineHeight:1, marginBottom:8 }}>{n}</div>
            <div style={{ fontSize:15, fontWeight:500, marginBottom:12 }}>{l}</div>
            <div style={{ fontSize:13, color:"var(--text-dim)", lineHeight:1.7, marginBottom:16 }}>{d}</div>
            <div style={{ display:"inline-block", padding:"4px 10px", background:"rgba(0,229,255,.08)", border:"1px solid rgba(0,229,255,.15)", fontSize:11, color:"var(--accent)", fontFamily:"'Space Mono',monospace", letterSpacing:".08em" }}>{t}</div>
          </div>
        ))}
      </div>
      {/* AB Test */}
      <div style={{ background:"var(--surface)", padding:"36px 40px", marginBottom:48 }}>
        <div style={{ fontSize:16, fontWeight:500, marginBottom:8 }}>AB测试验证：转化率提升27%背后的技术选择</div>
        <div style={{ fontSize:13, color:"var(--text-dim)", marginBottom:20 }}>2000+会话样本，验证意图识别环节的核心优化方向</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:2 }}>
          {[{ label:"A 组", title:"强化上下文建模（Transformer架构）", desc:'在意图识别环节加强多轮上下文建模，让模型更好理解"那个""上面说的"等指代关系，从根源上解决歧义问题（原来41%流失的核心原因）。', result:"+27% 转化率", winner:true },
            { label:"B 组", title:"增加多模态输入支持（图文混合理解）", desc:"增加对用户发送图片的理解能力，扩展输入模态。但实际上绝大多数歧义问题发生在纯文本对话中，多模态解决的是另一个维度的问题。", result:"效果不显著", winner:false }].map(col=>(
            <div key={col.label} style={{ padding:24, background:"var(--bg)", position:"relative" }}>
              {col.winner&&<div style={{ position:"absolute", top:12, right:12, fontFamily:"'Space Mono',monospace", fontSize:9, letterSpacing:".12em", color:"var(--accent)", background:"rgba(0,229,255,.1)", padding:"3px 8px" }}>WINNER</div>}
              <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"var(--text-dim)", letterSpacing:".1em", marginBottom:10 }}>{col.label}</div>
              <div style={{ fontSize:15, fontWeight:500, marginBottom:8 }}>{col.title}</div>
              <div style={{ fontSize:13, color:"var(--text-dim)", lineHeight:1.7, marginBottom:12 }}>{col.desc}</div>
              <div style={{ fontFamily:"'Space Mono',monospace", fontSize:18, color:col.winner?"var(--accent)":"var(--text-dim)", fontWeight:700 }}>{col.result}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:16, padding:"16px 20px", background:"rgba(0,229,255,.04)", border:"1px solid rgba(0,229,255,.1)" }}>
          <div style={{ fontSize:13, color:"var(--text-dim)", lineHeight:1.8 }}>A组胜出核心原因：意图识别环节是"漏斗里最大的破洞"（41%流失）。方法论：<strong style={{ color:"var(--text)" }}>优化前先找最大漏斗破洞，而不是什么方向看起来高级就做什么。</strong></div>
        </div>
      </div>
      <button onClick={()=>navigate("main")} style={{ background:"none", border:"1px solid var(--border)", color:"var(--text-dim)", padding:"12px 24px", cursor:"pointer", borderRadius:2, fontFamily:"'Noto Sans SC',sans-serif", fontSize:14, transition:"all .3s" }}
        onMouseEnter={e=>{ e.currentTarget.style.borderColor="var(--accent)"; e.currentTarget.style.color="var(--accent)"; }}
        onMouseLeave={e=>{ e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.color="var(--text-dim)"; }}>
        ← 返回主页
      </button>
    </div>
  );
}
