"use client";
// components/Project2Page.tsx
// 飞棋RPA项目 STAR 详解页
import type { PageName } from "@/app/page";
import { useState } from "react";

interface Props { navigate: (page: PageName) => void; }
type Tab = "S" | "T" | "A" | "R";

const tabLabels: Record<Tab,string> = { S:"Situation · 背景", T:"Task · 任务", A:"Action · 行动", R:"Result · 结果" };
const purple = "#a898ff";

export default function Project2Page({ navigate }: Props) {
  const [tab, setTab] = useState<Tab>("S");

  const tabBtn = (t: Tab): React.CSSProperties => ({
    padding: "18px 32px",
    fontFamily: "'Space Mono',monospace",
    fontSize: 11,
    letterSpacing: ".1em",
    color: tab===t ? purple : "var(--text-dim)",
    cursor: "pointer",
    borderBottom: `2px solid ${tab===t ? purple : "transparent"}`,
    border: "none",
    background: "none",
    display: "flex",
    alignItems: "center",
    gap: 10,
    transition: "all .3s",
  });

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", fontFamily:"'Noto Sans SC',sans-serif", color:"var(--text)" }}>
      {/* Hero */}
      <div style={{ padding:"80px 60px 60px", background:"linear-gradient(135deg,var(--surface) 0%,#120f1e 100%)", borderBottom:"1px solid var(--border)", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 50% 80% at 20% 50%,rgba(123,97,255,.1) 0%,transparent 70%)" }} />
        <button onClick={()=>navigate("main")} style={{ display:"inline-flex", alignItems:"center", gap:8, color:"var(--text-dim)", fontSize:13, cursor:"pointer", border:"none", background:"none", marginBottom:32, position:"relative", zIndex:10, padding:0, transition:"color .3s" }}
          onMouseEnter={e=>e.currentTarget.style.color=purple}
          onMouseLeave={e=>e.currentTarget.style.color="var(--text-dim)"}>
          ← 返回主页
        </button>
        <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:purple, letterSpacing:".15em", marginBottom:16 }}>PROJECT 02 · STAR 法则深度拆解</div>
        <h1 style={{ fontFamily:"'Noto Serif SC',serif", fontSize:"clamp(28px,4vw,48px)", fontWeight:300, lineHeight:1.25, marginBottom:20 }}>飞棋 RPA 工具全链路 AI 能力升级</h1>
        <p style={{ fontSize:15, color:"var(--text-dim)", lineHeight:1.8, maxWidth:640, marginBottom:40 }}>主导飞棋RPA设计器与管理中心的AI能力升级，将大模型能力融入元素捕获、指令搭建、任务调度三大核心模块，提升自动化流程的开发效率与系统稳定性。</p>
        <div style={{ display:"flex", gap:40, flexWrap:"wrap" }}>
          {[["80%","XPath定位成功率提升"],["50%","流程搭建时间缩短"],["100%","任务丢失率降低"],["1h","故障恢复缩短至"]].map(([n,l])=>(
            <div key={l}><div style={{ fontFamily:"'Space Mono',monospace", fontSize:32, fontWeight:700, color:purple, lineHeight:1 }}>{n}</div><div style={{ fontSize:12, color:"var(--text-dim)", marginTop:4 }}>{l}</div></div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ position:"sticky", top:0, zIndex:50, background:"rgba(10,12,16,.95)", backdropFilter:"blur(20px)", borderBottom:"1px solid var(--border)", display:"flex" }}>
        {(["S","T","A","R"] as Tab[]).map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={tabBtn(t)}>
            <div style={{ width:22, height:22, borderRadius:"50%", background:tab===t?purple:"rgba(123,97,255,.1)", color:tab===t?"var(--bg)":purple, border:"1px solid rgba(123,97,255,.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700 }}>{t}</div>
            {tabLabels[t]}
          </button>
        ))}
      </div>

      <div style={{ padding:"60px" }}>
        {tab==="S"&&<S2Panel />}
        {tab==="T"&&<T2Panel />}
        {tab==="A"&&<A2Panel />}
        {tab==="R"&&<R2Panel navigate={navigate} />}
      </div>
    </div>
  );
}

function S2Panel() {
  return (
    <div>
      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"#a898ff", letterSpacing:".15em", marginBottom:16 }}>SITUATION</div>
      <h2 style={{ fontFamily:"'Noto Serif SC',serif", fontSize:"clamp(28px,4vw,42px)", fontWeight:300, lineHeight:1.3, marginBottom:16 }}>三个结构性痛点，倒逼系统重构</h2>
      <p style={{ color:"var(--text-dim)", fontSize:15, lineHeight:1.8, maxWidth:560, marginBottom:60 }}>飞棋RPA在扩大规模过程中，开发体验和系统稳定性同时遇到瓶颈。</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:2, marginBottom:48 }}>
        {[
          { color:"#ff6b6b", icon:"🔧", title:"痛点一：XPath手动编写稳定性差", text:"传统XPath完全依赖人工手写，针对动态页面（如SPA、懒加载、异步渲染）极易因DOM结构微小变化而断裂，维护成本极高。", impact:"每次页面升级后调试耗时平均超1小时，严重阻塞交付节奏。" },
          { color:"#f0a040", icon:"⚙️", title:"痛点二：复杂流程搭建完全手工", text:"用户需要手动逐条配置指令、填写参数、编排流程顺序。复杂场景搭建耗时高达2小时，且极易出错，非技术用户几乎无法独立完成。", impact:"复杂流程搭建平均耗时2h，交付周期压缩空间受限。" },
          { color:"#a898ff", icon:"💥", title:"痛点三：任务队列级联故障风险", text:"管理中心线上任务与本地错误应用链路存在耦合——线上任务失败触发错误应用，错误应用也失败时，任务会静默丢失，无任何告警。", impact:"任务静默丢失、故障排查完全依赖人工逐条排查，恢复时间不可控。" },
        ].map(card=>(
          <div key={card.title} style={{ background:"var(--surface)", padding:"36px 32px", borderLeft:`3px solid ${card.color}` }}>
            <span style={{ fontSize:32, marginBottom:16, display:"block" }}>{card.icon}</span>
            <div style={{ fontSize:16, fontWeight:500, marginBottom:12 }}>{card.title}</div>
            <div style={{ fontSize:13, color:"var(--text-dim)", lineHeight:1.8, marginBottom:16 }}>{card.text}</div>
            <div style={{ padding:"10px 14px", background:"rgba(255,255,255,.03)", fontSize:12, color:"var(--text-dim)" }}><strong style={{ color:"var(--text)" }}>量化影响：</strong>{card.impact}</div>
          </div>
        ))}
      </div>
      <div style={{ background:"var(--surface)", padding:"32px 40px", borderLeft:"3px solid #a898ff" }}>
        <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"#a898ff", letterSpacing:".12em", marginBottom:12 }}>为什么这三个问题要同时解决？</div>
        <div style={{ fontSize:14, color:"var(--text-dim)", lineHeight:1.8 }}>这三个痛点分布在RPA产品的不同层次：<strong style={{ color:"var(--text)" }}>元素捕获（开发体验）→ 指令搭建（用户门槛）→ 任务调度（系统稳定性）</strong>。单独修一个只能治标，必须三层同时升级，才能真正把"开发效率"和"系统稳定性"这两个核心指标做上去。</div>
      </div>
    </div>
  );
}

function T2Panel() {
  return (
    <div>
      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"#a898ff", letterSpacing:".15em", marginBottom:16 }}>TASK</div>
      <h2 style={{ fontFamily:"'Noto Serif SC',serif", fontSize:"clamp(28px,4vw,42px)", fontWeight:300, lineHeight:1.3, marginBottom:16 }}>主导三大核心模块的AI能力融入</h2>
      <p style={{ color:"var(--text-dim)", fontSize:15, lineHeight:1.8, maxWidth:560, marginBottom:60 }}>不是局部优化，而是系统性地将大模型能力嵌入RPA产品的三个核心环节。</p>
      <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
        {[
          { num:"01", title:"AI辅助XPath元素捕获", desc:"解决传统手写XPath在动态页面下易断的核心问题。设计「DOM结构解析→大模型语义理解→多策略XPath生成」链路，输出带稳定性评分的多路径定位方案。", tags:["定位成功率+80%","调试耗时降低1h"] },
          { num:"02", title:"AI对话式指令流搭建", desc:"让用户用自然语言描述任务，大模型完成「任务理解→指令拆解→参数推断→流程编排」全链路转译，支持多轮追问迭代修正。降低RPA使用门槛，非技术用户也能独立完成复杂流程搭建。", tags:["搭建时间2h→1h","↓50%"] },
          { num:"03", title:"任务队列健壮性重构", desc:"识别并彻底消除线上任务与本地错误应用链路耦合的级联故障风险。重新设计分层重试策略，确保任务丢失率为零，并建立故障快速恢复机制。", tags:["任务丢失率降低100%","故障恢复缩短至1h"] },
        ].map(item=>(
          <div key={item.num} style={{ background:"var(--surface)", padding:"32px 36px", display:"flex", alignItems:"flex-start", gap:32 }}>
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:32, fontWeight:700, color:"rgba(168,152,255,.2)", lineHeight:1, flexShrink:0, width:48 }}>{item.num}</div>
            <div>
              <div style={{ fontSize:16, fontWeight:500, marginBottom:8 }}>{item.title}</div>
              <div style={{ fontSize:13, color:"var(--text-dim)", lineHeight:1.8, marginBottom:16 }}>{item.desc}</div>
              <div style={{ display:"flex", gap:8 }}>
                {item.tags.map(t=><span key={t} style={{ background:"rgba(123,97,255,.08)", border:"1px solid rgba(123,97,255,.2)", color:"#a898ff", fontSize:11, padding:"3px 10px", borderRadius:2, fontFamily:"'Space Mono',monospace" }}>{t}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function A2Panel() {
  return (
    <div>
      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"#a898ff", letterSpacing:".15em", marginBottom:16 }}>ACTION</div>
      <h2 style={{ fontFamily:"'Noto Serif SC',serif", fontSize:"clamp(28px,4vw,42px)", fontWeight:300, lineHeight:1.3, marginBottom:16 }}>三大模块的产品设计与落地决策</h2>
      <p style={{ color:"var(--text-dim)", fontSize:15, lineHeight:1.8, maxWidth:560, marginBottom:48 }}>每个模块都有独立的技术链路设计和关键决策点。</p>
      <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
        {/* M1 */}
        <div style={{ background:"var(--surface)", padding:"36px 40px", display:"grid", gridTemplateColumns:"180px 1fr", gap:40, alignItems:"start", borderLeft:"3px solid rgba(168,152,255,.4)" }}>
          <div><div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"#a898ff", letterSpacing:".15em", marginBottom:8 }}>MODULE 01</div><div style={{ fontSize:16, fontWeight:500 }}>AI辅助XPath元素捕获</div></div>
          <div>
            {/* Flow */}
            <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", marginBottom:20, padding:"16px 20px", background:"var(--bg)", border:"1px solid rgba(123,97,255,.12)", borderRadius:2 }}>
              {["DOM\n结构解析","大模型\n语义理解","多策略\nXPath生成","稳定性评分\n多路径输出"].map((node,i)=>(
                <>
                  <div key={node} style={{ background:"var(--surface)", border:`1px solid rgba(168,152,255,${i===3?0.4:0.2})`, padding:"8px 14px", fontSize:12, color:i===3?"var(--accent)":"#a898ff", borderRadius:2, textAlign:"center" }}>
                    {node.split("\n").map((l,li)=><div key={li} style={{ ...(li>0?{fontSize:11,color:"var(--text-dim)",marginTop:3}:{}) }}>{l}</div>)}
                  </div>
                  {i<3&&<span key={`a${i}`} style={{ color:"rgba(168,152,255,.4)", fontSize:14, margin:"0 4px" }}>→</span>}
                </>
              ))}
            </div>
            <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:8 }}>
              {['为什么要多路径输出？动态页面没有绝对"正确"的XPath。输出带稳定性评分的多路径方案，让系统在主路径失败时自动fallback到备选路径。',"稳定性评分维度：基于路径长度（越短越稳定）、属性类型（id>class>结构位置）、历史成功率三个维度综合打分。",'大模型核心作用：理解"这个按钮的语义是提交"，而不是机械记住"第3个div下的第2个button"——语义锚点比结构锚点稳定得多。'].map(item=>(
                <li key={item} style={{ fontSize:13, color:"var(--text-dim)", lineHeight:1.7, paddingLeft:16, position:"relative" }}>
                  <span style={{ position:"absolute", left:4, color:"#a898ff", fontSize:16, lineHeight:1.3 }}>·</span>{item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* M2 */}
        <div style={{ background:"var(--surface)", padding:"36px 40px", display:"grid", gridTemplateColumns:"180px 1fr", gap:40, alignItems:"start", borderLeft:"3px solid rgba(168,152,255,.4)" }}>
          <div><div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"#a898ff", letterSpacing:".15em", marginBottom:8 }}>MODULE 02</div><div style={{ fontSize:16, fontWeight:500 }}>AI对话式指令流搭建</div></div>
          <div>
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"var(--text-dim)", letterSpacing:".08em", marginBottom:12, textTransform:"uppercase" }}>多轮追问策略（四类模糊情形）</div>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead><tr>{["情形","识别特征","追问策略","终止条件"].map(h=><th key={h} style={{ fontFamily:"'Space Mono',monospace", fontSize:10, letterSpacing:".1em", color:"var(--text-dim)", textAlign:"left", padding:"8px 14px", borderBottom:"1px solid var(--border)" }}>{h}</th>)}</tr></thead>
              <tbody>{[["目标模糊",'动词+宽泛名词，如"处理一下订单"',"给出2-3个具体解读选项让用户确认","用户明确选择或修正意图"],["参数缺失","关键字段未提及（如频率、范围）","精准追问缺失字段，一次只追一个","所有必填参数已填充"],["意图冲突","同一描述中包含互斥条件","复述检测到的冲突，请用户仲裁","冲突消解，逻辑自洽"],["边界不清","异常处理/循环终止条件未定义","主动提示用户定义边界，给出默认值建议","用户确认或接受默认值"]].map(row=><tr key={row[0]}>{row.map((cell,ci)=><td key={ci} style={{ fontSize:13, color:ci===0?"#a898ff":"var(--text-dim)", padding:"10px 14px", borderBottom:"1px solid rgba(255,255,255,.04)" }}>{cell}</td>)}</tr>)}</tbody>
            </table>
            <div style={{ marginTop:16, background:"rgba(0,229,255,.03)", borderLeft:"2px solid rgba(0,229,255,.3)", padding:"12px 16px" }}>
              <div style={{ fontSize:11, color:"var(--accent)", fontFamily:"'Space Mono',monospace", letterSpacing:".08em", marginBottom:6 }}>关键设计原则：一次只追一个问题</div>
              <div style={{ fontSize:13, color:"var(--text-dim)", lineHeight:1.7 }}>一次提多个问题会让用户感到被审问，流失率高。系统按优先级排队，最影响下一步执行的缺失信息优先追问。</div>
            </div>
          </div>
        </div>
        {/* M3 */}
        <div style={{ background:"var(--surface)", padding:"36px 40px", display:"grid", gridTemplateColumns:"180px 1fr", gap:40, alignItems:"start", borderLeft:"3px solid rgba(168,152,255,.4)" }}>
          <div><div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"#a898ff", letterSpacing:".15em", marginBottom:8 }}>MODULE 03</div><div style={{ fontSize:16, fontWeight:500 }}>任务队列健壮性重构</div></div>
          <div>
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"var(--text-dim)", letterSpacing:".08em", marginBottom:12, textTransform:"uppercase" }}>级联故障链路（改造前 vs 改造后）</div>
            <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", marginBottom:16, padding:"16px 20px", background:"var(--bg)", border:"1px solid rgba(255,107,107,.12)", borderRadius:2 }}>
              {["线上任务失败\n触发错误应用","错误应用失败\n无兜底","任务静默丢失\n无告警·无感知"].map((node,i)=>(
                <>
                  <div key={node} style={{ background:"rgba(255,107,107,.08)", border:"1px solid rgba(255,107,107,.2)", padding:"8px 14px", fontSize:12, color:i===2?"#ff6b6b":"#ff9090", borderRadius:2, textAlign:"center", fontWeight:i===2?500:300 }}>
                    {node.split("\n").map((l,li)=><div key={li} style={{ ...(li>0?{fontSize:11,color:"var(--text-dim)",marginTop:3}:{}) }}>{l}</div>)}
                  </div>
                  {i<2&&<span key={`a${i}`} style={{ color:"rgba(255,107,107,.4)", fontSize:14, margin:"0 4px" }}>→</span>}
                </>
              ))}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:2, marginBottom:16 }}>
              {[{ name:"线上任务层", desc:"独立重试队列，按指数退避策略自动重试，不依赖错误应用层的状态。重试超过阈值后上报熔断信号。" },{ name:"错误应用层", desc:"独立重试逻辑，与线上任务层完全解耦。两层各自失败互不干扰，跨层失败统一熔断上报。" }].map(l=>(
                <div key={l.name} style={{ background:"rgba(123,97,255,.05)", border:"1px solid rgba(123,97,255,.15)", padding:"20px 22px" }}>
                  <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"#a898ff", marginBottom:10 }}>{l.name}</div>
                  <div style={{ fontSize:13, color:"var(--text-dim)", lineHeight:1.7 }}>{l.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ background:"rgba(255,165,0,.05)", borderLeft:"2px solid #f0a040", padding:"12px 16px" }}>
              <div style={{ fontSize:11, color:"#f0a040", fontFamily:"'Space Mono',monospace", letterSpacing:".08em", marginBottom:6 }}>如何识别到这个级联风险的？</div>
              <div style={{ fontSize:13, color:"var(--text-dim)", lineHeight:1.7 }}>并非来自压测，而是通过<strong style={{ color:"var(--text)" }}>线上问题复盘</strong>——某次大促后出现任务数量对不上的异常，但系统没有报错日志。逐步追查链路发现错误应用会消费线上任务的失败事件，从而确认了耦合点。</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function R2Panel({ navigate }: { navigate: (p: PageName) => void }) {
  return (
    <div>
      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"#a898ff", letterSpacing:".15em", marginBottom:16 }}>RESULT</div>
      <h2 style={{ fontFamily:"'Noto Serif SC',serif", fontSize:"clamp(28px,4vw,42px)", fontWeight:300, lineHeight:1.3, marginBottom:16 }}>三大模块全部达成目标</h2>
      <p style={{ color:"var(--text-dim)", fontSize:15, lineHeight:1.8, maxWidth:560, marginBottom:60 }}>三个模块分别在开发效率、用户门槛、系统稳定性三个维度取得明确的量化结果。</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:2, marginBottom:48 }}>
        {[["80%","动态页面XPath定位成功率提升","多路径+稳定性评分策略，让XPath在页面DOM变化时自动降级到备选路径。","调试耗时降低1h/次"],["50%","复杂流程搭建时间缩短","2小时→1小时，自然语言驱动+多轮追问消除了大量手动配置步骤。","2h→1h（精确压缩）"],["100%","任务丢失率降低","分层重试+熔断上报彻底消除任务静默丢失。改造后任何任务失败都会触发告警。","故障恢复缩短至1h"],["3合1","系统性AI能力升级","三个模块并行推进，共同交付，为后续更多AI模块扩展打下架构基础。","开发效率+系统稳定性双提升"]].map(([n,l,d,t])=>(
          <div key={l} style={{ background:"var(--surface)", padding:"40px 36px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2, background:"linear-gradient(90deg,var(--accent2),#a898ff)" }} />
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:48, fontWeight:700, color:"#a898ff", lineHeight:1, marginBottom:8 }}>{n}</div>
            <div style={{ fontSize:15, fontWeight:500, marginBottom:12 }}>{l}</div>
            <div style={{ fontSize:13, color:"var(--text-dim)", lineHeight:1.7, marginBottom:16 }}>{d}</div>
            <div style={{ display:"inline-block", padding:"4px 10px", background:"rgba(123,97,255,.08)", border:"1px solid rgba(123,97,255,.3)", fontSize:11, color:"#a898ff", fontFamily:"'Space Mono',monospace", letterSpacing:".08em" }}>{t}</div>
          </div>
        ))}
      </div>
      {/* Methodology */}
      <div style={{ marginBottom:48 }}>
        <div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"#a898ff", letterSpacing:".15em", marginBottom:24 }}>可复用方法论</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:2 }}>
          {[{ num:"01", title:"大模型做语义，规则做评分", value:"↗ 可解释性", desc:"XPath生成中大模型负责语义理解，稳定性评分由规则引擎保证可解释。两者分工，出问题时可定位。" },{ num:"02", title:"追问一次只解决一个问题", value:"↗ 用户体验", desc:"对话式指令搭建中，按优先级队列逐一追问缺失信息，不堆砌问题。用户负担最小化。" },{ num:"03", title:"解耦是系统稳定性的前提", value:"↗ 系统健壮", desc:'任务队列重构的核心不是"加重试"，而是"先解耦"——两层各自独立重试，跨层失败才熔断。' }].map(m=>(
            <div key={m.num} style={{ background:"var(--surface)", padding:"32px 28px" }}>
              <div style={{ fontFamily:"'Space Mono',monospace", fontSize:36, fontWeight:700, color:"rgba(168,152,255,.15)", lineHeight:1, marginBottom:12 }}>{m.num}</div>
              <div style={{ fontSize:15, fontWeight:500, marginBottom:8 }}>{m.title}</div>
              <div style={{ fontSize:13, color:"#a898ff", marginBottom:12 }}>{m.value}</div>
              <div style={{ fontSize:13, color:"var(--text-dim)", lineHeight:1.7 }}>{m.desc}</div>
            </div>
          ))}
        </div>
      </div>
      <button onClick={()=>navigate("main")} style={{ background:"none", border:"1px solid var(--border)", color:"var(--text-dim)", padding:"12px 24px", cursor:"pointer", borderRadius:2, fontFamily:"'Noto Sans SC',sans-serif", fontSize:14, transition:"all .3s" }}
        onMouseEnter={e=>{ e.currentTarget.style.borderColor="#a898ff"; e.currentTarget.style.color="#a898ff"; }}
        onMouseLeave={e=>{ e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.color="var(--text-dim)"; }}>
        ← 返回主页
      </button>
    </div>
  );
}
