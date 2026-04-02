# AI 助手界面设计

<cite>
**本文档引用的文件**
- [app/page.tsx](file://app/page.tsx)
- [components/AiBot.tsx](file://components/AiBot.tsx)
- [components/CopilotAssistantMessage.tsx](file://components/CopilotAssistantMessage.tsx)
- [components/CopilotProviders.tsx](file://components/CopilotProviders.tsx)
- [components/MainPage.tsx](file://components/MainPage.tsx)
- [components/ProjectPage.tsx](file://components/ProjectPage.tsx)
- [components/Project2Page.tsx](file://components/Project2Page.tsx)
- [app/globals.css](file://app/globals.css)
- [lib/resumeData.ts](file://lib/resumeData.ts)
- [package.json](file://package.json)
</cite>

## 更新摘要
**变更内容**
- 新增规则系统章节，详细说明卡片式对话模式与自由格式对话模式的分流机制
- 添加多轮追问策略和模糊情形识别规则
- 更新对话策略改进说明，包括决策标准和输出规范
- 新增 Function Calling 状态指示器的实现细节

## 目录
1. [简介](#简介)
2. [项目结构](#项目结构)
3. [核心组件](#核心组件)
4. [架构总览](#架构总览)
5. [详细组件分析](#详细组件分析)
6. [规则系统](#规则系统)
7. [多轮追问策略](#多轮追问策略)
8. [依赖分析](#依赖分析)
9. [性能考虑](#性能考虑)
10. [故障排查指南](#故障排查指南)
11. [结论](#结论)
12. [附录](#附录)

## 简介
本项目为一个赛博朋克风格的 AI 助手界面，围绕"傅倩娇"的个人简历与求职目标，提供可定制的对话体验。界面采用深色主题、青紫渐变与发光效果，结合 CopilotKit 提供的聊天 UI 与 Function Calling 能力，实现"结构化卡片 + 流式回复"的复合消息展示。新增的规则系统确保对话模式的智能分流，包括卡片式对话模式与自由格式对话模式的明确决策标准和对话策略改进。

## 项目结构
- 应用入口与路由：app/page.tsx 负责页面切换与 AiBot 常驻展示。
- 核心对话组件：components/AiBot.tsx 提供聊天面板、欢迎语、快捷问题、结构化卡片与 Function Calling 状态指示器，包含完整的规则系统。
- 自定义助手消息渲染：components/CopilotAssistantMessage.tsx 控制助手消息的 Markdown 展示、操作栏与空回复提示。
- 运行时与 API 集成：components/CopilotProviders.tsx 封装 CopilotKit Provider、SiliconFlow Key 管理与服务端 Key 探测。
- 主页与页面导航：components/MainPage.tsx、components/ProjectPage.tsx 提供主页与项目详情页，配合 AiBot 的卡片联动。
- 项目详情页：components/Project2Page.tsx 展示 AI 对话式指令流搭建的多轮追问策略。
- 样式与主题：app/globals.css 定义 CSS 变量、气泡样式、输入区布局、动画与响应式网格。
- 知识库数据：lib/resumeData.ts 提供简历、项目、技能、匹配度等结构化数据，驱动 AiBot 的卡片生成。
- 依赖：package.json 中包含 @copilotkit/react-core、react、next 等依赖。

```mermaid
graph TB
A["app/page.tsx"] --> B["components/MainPage.tsx"]
A --> C["components/ProjectPage.tsx"]
A --> D["components/AiBot.tsx"]
D --> E["components/CopilotAssistantMessage.tsx"]
D --> F["components/CopilotProviders.tsx"]
D --> G["lib/resumeData.ts"]
D --> H["app/globals.css"]
I["components/Project2Page.tsx"] --> J["多轮追问策略"]
```

图表来源
- [app/page.tsx:11-29](file://app/page.tsx#L11-L29)
- [components/AiBot.tsx:1-31](file://components/AiBot.tsx#L1-L31)
- [components/CopilotAssistantMessage.tsx:37-52](file://components/CopilotAssistantMessage.tsx#L37-L52)
- [components/CopilotProviders.tsx:49-156](file://components/CopilotProviders.tsx#L49-L156)
- [lib/resumeData.ts:5-260](file://lib/resumeData.ts#L5-L260)
- [app/globals.css:1-122](file://app/globals.css#L1-L122)
- [components/Project2Page.tsx:150-247](file://components/Project2Page.tsx#L150-L247)

章节来源
- [app/page.tsx:11-29](file://app/page.tsx#L11-L29)
- [package.json:12-20](file://package.json#L12-L20)

## 核心组件
- AiBot 对话面板：负责欢迎语、快捷问题、Function Calling 状态条、结构化卡片（项目亮点、技能图谱、岗位匹配度）与输入区集成，内置完整的规则系统。
- CopilotAssistantMessage 自定义渲染：确保"卡片 + 正文"组合展示，控制操作栏位置与空回复提示。
- CopilotProviders 运行时封装：注入运行时 URL、禁用 Inspector、屏蔽开发台弹窗、处理服务端 Key 与浏览器 Key 的优先级。
- 主页与项目页：提供导航与内容展示，配合 AiBot 的卡片联动跳转。
- 项目详情页：展示 AI 对话式指令流搭建的多轮追问策略和模糊情形识别。
- 样式与主题：通过 CSS 变量统一背景、表面、强调色、边框与发光；通过 keyframes 定义气泡、进度条、脉冲等动画。

章节来源
- [components/AiBot.tsx:23-26](file://components/AiBot.tsx#L23-L26)
- [components/CopilotAssistantMessage.tsx:37-195](file://components/CopilotAssistantMessage.tsx#L37-L195)
- [components/CopilotProviders.tsx:49-156](file://components/CopilotProviders.tsx#L49-L156)
- [app/globals.css:25-122](file://app/globals.css#L25-L122)

## 架构总览
整体架构围绕"页面 + 对话 + 主题 + 数据 + 规则"展开：
- 页面层：Home 负责路由切换与常驻 AiBot。
- 对话层：AiBot 使用 CopilotKit 的 Chat 与 AssistantMessage，结合自定义卡片与 Function Calling 状态条。
- 规则层：内置完整的对话模式分流规则，确保卡片式与自由格式对话的智能切换。
- 主题层：CSS 变量与 keyframes 统一气泡、输入区、操作栏、滚动条与动画。
- 数据层：resumeData 提供结构化数据，驱动卡片生成与匹配度计算。

```mermaid
sequenceDiagram
participant U as "用户"
participant H as "Home(app/page.tsx)"
participant AB as "AiBot(components/AiBot.tsx)"
participant CP as "CopilotProviders(components/CopilotProviders.tsx)"
participant CK as "CopilotKit(React UI)"
participant RS as "规则系统(Rules)"
participant RD as "resumeData(lib/resumeData.ts)"
U->>H : 切换页面
H-->>AB : 传递 navigate/currentPage
AB->>CP : 初始化运行时(运行时URL/Headers)
AB->>RS : 应用对话规则分流
AB->>CK : 渲染 CopilotChat 与 AssistantMessage
AB->>RD : 读取结构化数据(技能/项目/匹配度)
CK-->>AB : 流式消息/卡片/状态
AB-->>U : 显示气泡/卡片/操作栏/FC状态条
```

图表来源
- [app/page.tsx:11-29](file://app/page.tsx#L11-L29)
- [components/AiBot.tsx:1-31](file://components/AiBot.tsx#L1-L31)
- [components/CopilotProviders.tsx:144-156](file://components/CopilotProviders.tsx#L144-L156)
- [lib/resumeData.ts:5-260](file://lib/resumeData.ts#L5-L260)

## 详细组件分析

### AiBot 对话面板
- 欢迎语与快捷问题：首次进入展示欢迎语，随后在底部建议区呈现胶囊式快捷问题，风格与顶部快捷胶囊一致。
- Function Calling 状态条：当存在进行中的函数调用时，显示带闪烁动画的状态条，颜色为青色系渐变。
- 结构化卡片：
  - 项目亮点卡片：展示项目名称、指标徽章与"查看完整 STAR 拆解"按钮。
  - 技能图谱卡片：按板块展示技能芯片与交付指标，支持强调态与 CTAs。
  - 岗位匹配度卡片：展示综合得分、维度得分与强项/缺口说明，支持展开联系方式。
- 气泡与操作栏：统一气泡字号、行高、圆角与内边距；操作栏位于气泡或卡片底部外侧，支持复制、再生、点赞/踩。
- 输入区：横向布局，左侧输入框右侧发送按钮，渐变色发送键，输入区带边框与发光。

```mermaid
classDiagram
class AiBot {
+Props.navigate
+Props.currentPage
+quickActions[]
+FcSection(text)
+WelcomeAnchor()
+ProjectHighlightCardUI()
+SkillsStackCardUI()
+JobMatchCardWithContact()
}
class CopilotAssistantMessage {
+message
+isLoading
+isGenerating
+onCopy()
+onRegenerate()
+onThumbsUp()
+onThumbsDown()
}
class CopilotProviders {
+userApiKey
+setUserApiKey()
+serverKeyConfigured
}
class resumeData {
+basic
+projects[]
+skills
+matchScore
+skillsChatCard
+jobMatchAliAiNotebookCard
}
AiBot --> CopilotAssistantMessage : "渲染助手消息"
AiBot --> CopilotProviders : "使用运行时"
AiBot --> resumeData : "读取数据"
```

图表来源
- [components/AiBot.tsx:28-31](file://components/AiBot.tsx#L28-L31)
- [components/CopilotAssistantMessage.tsx:37-52](file://components/CopilotAssistantMessage.tsx#L37-L52)
- [components/CopilotProviders.tsx:15-26](file://components/CopilotProviders.tsx#L15-L26)
- [lib/resumeData.ts:5-260](file://lib/resumeData.ts#L5-L260)

章节来源
- [components/AiBot.tsx:34-792](file://components/AiBot.tsx#L34-L792)
- [app/globals.css:92-475](file://app/globals.css#L92-L475)

### Function Calling 状态指示器
- 状态条结构：包含闪烁圆点与文案，使用 CSS keyframes 实现呼吸/闪烁效果。
- 触发条件：当存在进行中的函数调用时显示；文本来自上下文或运行时状态。
- 视觉反馈：圆点使用青色系渐变，文案使用强调色与紧凑字距，背景带轻微边框与圆角。

```mermaid
flowchart TD
Start(["进入 AiBot 渲染"]) --> CheckFC["检查是否存在 FC 文本"]
CheckFC --> |有| RenderFC["渲染 FC 状态条<br/>含闪烁圆点与文案"]
CheckFC --> |无| Skip["跳过 FC 状态条"]
RenderFC --> Animate["应用 fcBlink keyframes"]
Animate --> End(["完成渲染"])
Skip --> End
```

图表来源
- [components/AiBot.tsx:713-757](file://components/AiBot.tsx#L713-L757)
- [app/globals.css:92-101](file://app/globals.css#L92-L101)

章节来源
- [components/AiBot.tsx:713-757](file://components/AiBot.tsx#L713-L757)
- [app/globals.css:92-101](file://app/globals.css#L92-L101)

### 聊天气泡设计规范
- 字体与行高：统一使用 14px 字号、1.6 行高、400 字重，与 Markdown 元素一致。
- 圆角与边框：气泡圆角 12px，边框 1px，背景与边框透明度与主题一致。
- 内边距：气泡内边距 16px 22px，避免文字贴边。
- 最大宽度：气泡最大宽度限制在 92% 或 22rem，避免拉满屏幕。
- 用户气泡与助手气泡：用户气泡右对齐，助手气泡左对齐；助手 Markdown 气泡独立于外层容器，操作栏位于气泡下方。
- Markdown 元素：标题、段落、列表、代码块等尺寸与行高与气泡一致，避免层级放大。

```mermaid
flowchart TD
Msg["助手消息"] --> Bubble["气泡容器(透明背景)"]
Bubble --> MD["Markdown 气泡(圆角/边框/内边距)"]
MD --> Controls["操作栏(复制/再生/点赞/踩)"]
Msg --> Cards["结构化卡片(可选)"]
Cards --> Controls2["卡片底部操作栏(可选)"]
```

图表来源
- [app/globals.css:124-286](file://app/globals.css#L124-L286)
- [components/CopilotAssistantMessage.tsx:162-195](file://components/CopilotAssistantMessage.tsx#L162-L195)

章节来源
- [app/globals.css:124-286](file://app/globals.css#L124-L286)
- [components/CopilotAssistantMessage.tsx:162-195](file://components/CopilotAssistantMessage.tsx#L162-L195)

### 响应式设计
- 主页 Hero 数字团队网格：移动端单列，480px 以上双列，末尾卡片跨列。
- 滚动条：自定义滚动条宽度与颜色，提升深色主题下的可读性。
- 关键动画：fadeUp、pulse、fabCyberPulse、barIn 等，用于页面进入、脉冲与进度条填充。

```mermaid
flowchart TD
Viewport["视口宽度"] --> Mobile{"< 480px ?"}
Mobile --> |是| Grid1["grid-template-columns: 1fr"]
Mobile --> |否| Grid2["grid-template-columns: repeat(2, minmax(0, 1fr))"]
Grid1 --> Span["末尾卡片跨列"]
Grid2 --> Span
```

图表来源
- [app/globals.css:493-508](file://app/globals.css#L493-L508)

章节来源
- [app/globals.css:493-508](file://app/globals.css#L493-L508)

### 主题与样式覆盖
- CSS 变量：:root 定义 --bg/--surface/--accent/--text/--border 等，全局生效。
- CopilotKit 覆盖：通过 .copilot-custom 与 .copilotKitChat.copilot-custom 覆盖默认气泡、消息、输入区、操作栏与底部建议区样式。
- 气泡与输入区：统一字号、行高、圆角、边框、内边距与字体族，确保一致性。
- 操作栏：固定在气泡或卡片底部外侧，可见性与交互状态明确。
- 底部建议区：胶囊式快捷问题，小字号、圆角药丸、悬停过渡。

章节来源
- [app/globals.css:2-12](file://app/globals.css#L2-L12)
- [app/globals.css:25-122](file://app/globals.css#L25-L122)
- [app/globals.css:315-383](file://app/globals.css#L315-L383)

### 自定义选项与样式覆盖方法
- 主题定制：通过修改 :root 变量即可改变整体色调与对比度。
- 气泡样式：通过 --ck-bubble-* 变量与 .copilot-custom 覆盖气泡外观。
- 输入区与发送键：通过 .copilot-custom .copilotKitInput 与 .copilotKitInputControlButton 调整布局与颜色。
- 操作栏：通过 .copilotKitMessageControls 与 .copilotKitMessageControlButton 调整按钮尺寸与状态。
- 建议区：通过 .suggestions 与 .suggestion 类调整胶囊式快捷问题的尺寸、颜色与过渡。

章节来源
- [app/globals.css:38-122](file://app/globals.css#L38-L122)
- [app/globals.css:315-383](file://app/globals.css#L315-L383)

### 交互行为说明
- 复制/再生/点赞/踩：助手消息操作栏支持复制完整回复块、再生回复、点赞/踩反馈。
- 空回复提示：当助手回复为空且无卡片时，显示"未收到文字回复"的提示。
- 滚动与定位：首页"查看项目佐证"按钮点击后平滑滚动到指定位置。
- FAB 联系我：点击展开联系信息，悬停时渐变光晕与阴影增强赛博朋克氛围。

章节来源
- [components/CopilotAssistantMessage.tsx:75-112](file://components/CopilotAssistantMessage.tsx#L75-L112)
- [components/AiBot.tsx:614-655](file://components/AiBot.tsx#L614-L655)
- [components/MainPage.tsx:611-650](file://components/MainPage.tsx#L611-L650)

## 规则系统

### 卡片式对话模式与自由格式对话模式分流

新增的规则系统确保对话模式的智能分流，包含以下核心规则：

#### 引导逻辑（必须遵守）
1. **分流**：用户开口后先用一句话对齐意图：项目/技术、AI 笔记观点、岗位匹配，还是联系方式；不要重复朗读整段欢迎语。
2. **快捷按钮**：用户可用顶部快捷按钮发起问题；若已发起，直接执行对应能力，少废话。
3. **Function 调用**：调用 function 时，用户会在上方看到橙色"正在检索…"状态条；正文保持简洁。
4. **核心项目总览**：当用户问"有哪些核心项目经历""核心项目有哪些""项目经历有哪些"等总览问题时，**必须调用一次** showCoreProjectsOverview（无参数），会同时出现千牛、飞棋两张结构化卡片并可跳转 STAR 页。
5. **单项目或深挖**：只问千牛或只问飞棋某一侧时，调用 showProjectHighlights 并传对应 projectId。
6. **岗位匹配度**：用户问"与阿里 AI 笔记岗位匹配度""岗位匹配""JD 匹配""面试匹配"等时，**必须调用一次** showJobMatchCard（无参数）。
7. **技术栈与技能**：用户问"技术栈""技能有哪些""会用哪些工具""能力图谱"等时，**必须调用一次** showSkillsStackCard（无参数）。
8. **AI 笔记总览**：用户问"整体看法""有哪些洞察""AI笔记""NotebookLM"等未指定单点时，只调用 showAiNotebookOpinionsAll（无参数）。
9. **AI 笔记单点**：仅当用户明确追问某一子话题时，调用 showAiNotebookOpinion 并选对 opinionId。
10. **硬性禁止**：调用 showAiNotebookOpinionsAll 或 showAiNotebookOpinion 之后，正文中不得再写编号列表或自然段去复述卡片里已有的标题、缺口、建议。
11. **联系**：用户明确要联系方式且未在岗位匹配卡片内展开时，调用 getContactInfo。
12. **页面导航**：用户同意深入或要看 STAR 页时调用 navigateToPage；话术像导游。
13. **多轮上下文**：会收到"本地持久化对话记忆"含最近 3 条摘要与长期摘要；请连贯承接，除非用户明确换话题。

#### 卡片 vs 自由问答 — 分流（防空白回复）
- **只有**用户意图**明确对应**下方某条"引导逻辑"里的 Function 时，才调用该工具（展示卡片）。**禁止**在模糊提问上强行调用卡片后又不在气泡里写任何字。
- 泛指"工作经验""工作背景""经历""她是谁""擅长什么""怎么样"等，且**没有**同时表达"有哪些核心项目""项目经历有哪些""项目总览""看两个项目""岗位匹配度""JD""技术栈""能力图谱""AI笔记看法""联系方式"等**明确触发**时：**不要调用任何卡片工具**，只用"自由问答规则"输出 50～120 字纯文本。
- **禁止**仅因出现"经验""经历"就调用 showCoreProjectsOverview；该工具只用于用户**明确要**千牛+飞棋两项目并排卡片时。
- 用户一句话太模糊、无法判断要卡片还是聊天时：允许用**不超过 2 句**口语反问澄清（仍属自由问答、不调用工具）。

#### 输出总原则 — 禁止沉默
每一轮回复都必须有可见的助手气泡文字（卡片回合为短气泡，自由问答为长气泡），**不允许**整轮无任何文字。

#### 卡片回合气泡规则
本回合若调用了任一前端结构化卡片（getContactInfo、showCoreProjectsOverview、showJobMatchCard、showSkillsStackCard、showProjectHighlights、showAiNotebookOpinionsAll 等），你必须在展示卡片的同时输出**≤25 字**的纯文本气泡：口语化、无 Markdown、不复述卡片内已有数据；**禁止**沉默、**禁止**用长段落或列表复述卡片内容。

#### 非卡片回合 — 自由问答
当用户的问题**未**触发任何 Function（无上述卡片）时，你必须用**50～120 字**的纯文本气泡回复（口语化、结尾带一句引导）。

#### 自由问答规则 — 优先级最高
当用户提的问题不触发任何 Function（卡片），必须用气泡文字回复，不允许沉默。回复规范：
1. 字数：50～120 字之间，不超过 3 句话
2. 禁止 Markdown（无 **加粗**、无列表、无标题）
3. 语气：像真人助手，口语化，不要官方腔
4. 内容：基于 RESUME_DATA 里的真实信息回答，不要编造
5. 结尾：用一句引导语带出相关的快捷问题

```mermaid
flowchart TD
User["用户提问"] --> Intent["意图识别"]
Intent --> Card{"是否明确触发卡片功能？"}
Card --> |是| CardMode["卡片式对话模式"]
Card --> |否| FreeMode["自由格式对话模式"]
CardMode --> CardRules["应用卡片规则<br/>50-120字纯文本"]
FreeMode --> FreeRules["应用自由问答规则<br/>≤25字气泡+长文本回复"]
CardRules --> Output["输出卡片+气泡"]
FreeRules --> Output
```

图表来源
- [components/AiBot.tsx:1545-1591](file://components/AiBot.tsx#L1545-L1591)

章节来源
- [components/AiBot.tsx:1545-1591](file://components/AiBot.tsx#L1545-L1591)

## 多轮追问策略

### 四类模糊情形识别与处理

项目详情页展示了完整的多轮追问策略，针对四种典型的模糊情形：

#### 目标模糊
- **识别特征**：动词+宽泛名词，如"处理一下订单"
- **追问策略**：给出2-3个具体解读选项让用户确认
- **终止条件**：用户明确选择或修正意图

#### 参数缺失
- **识别特征**：关键字段未提及（如频率、范围）
- **追问策略**：精准追问缺失字段，一次只追一个
- **终止条件**：所有必填参数已填充

#### 意图冲突
- **识别特征**：同一描述中包含互斥条件
- **追问策略**：复述检测到的冲突，请用户仲裁
- **终止条件**：冲突消解，逻辑自洽

#### 边界不清
- **识别特征**：异常处理/循环终止条件未定义
- **追问策略**：主动提示用户定义边界，给出默认值建议
- **终止条件**：用户确认或接受默认值

#### 关键设计原则
**一次只追一个问题**：一次提多个问题会让用户感到被审问，流失率高。系统按优先级排队，最影响下一步执行的缺失信息优先追问。

```mermaid
flowchart TD
Start["用户模糊提问"] --> Analyze["分析模糊类型"]
Analyze --> Target{"目标模糊？"}
Target --> |是| Option["提供2-3个选项"]
Target --> |否| Param{"参数缺失？"}
Param --> |是| Field["追问缺失字段"]
Param --> |否| Conflict{"意图冲突？"}
Conflict --> |是| Arbitration["冲突仲裁"]
Conflict --> |否| Boundary{"边界不清？"}
Boundary --> |是| Default["默认值建议"]
Boundary --> |否| Clear["问题清晰"]
Option --> Clarify["用户选择"]
Field --> Clarify
Arbitration --> Clarify
Default --> Clarify
Clarify --> End["继续对话"]
Clear --> End
```

图表来源
- [components/Project2Page.tsx:163-171](file://components/Project2Page.tsx#L163-L171)

章节来源
- [components/Project2Page.tsx:163-171](file://components/Project2Page.tsx#L163-L171)

## 依赖分析
- @copilotkit/react-core：提供运行时与核心能力。
- @copilotkit/react-ui：提供聊天 UI 组件（CopilotChat、AssistantMessage 等）。
- @copilotkit/runtime-client-gql：客户端 GraphQL 运行时。
- next、react、react-dom：Next.js 14 与 React 生态。
- patch-package：应用补丁以修复第三方包问题。

```mermaid
graph TB
P["package.json"] --> C1["@copilotkit/react-core"]
P --> C2["@copilotkit/react-ui"]
P --> C3["@copilotkit/runtime-client-gql"]
P --> N["next"]
P --> R["react/react-dom"]
```

图表来源
- [package.json:12-20](file://package.json#L12-L20)

章节来源
- [package.json:12-20](file://package.json#L12-L20)

## 性能考虑
- 流式渲染：CopilotKit 支持流式消息，AiBot 通过 isGenerating 与 isLoading 控制加载状态，避免阻塞。
- 动画与绘制：OrbCanvas 使用 requestAnimationFrame 绘制，注意在组件卸载时取消动画帧；建议在组件销毁时清理资源。
- 滚动性能：消息列表使用 flex 布局与最小高度约束，避免内容过多时的重排。
- 图片与音频：背景音乐采用同源 MP3，预加载与 readyState 检测减少首播卡顿。
- 规则系统优化：规则引擎采用缓存机制，避免重复计算相同的对话模式分流。

章节来源
- [components/AiBot.tsx:794-850](file://components/AiBot.tsx#L794-L850)
- [components/BackgroundMusic.tsx:17-34](file://components/BackgroundMusic.tsx#L17-L34)

## 故障排查指南
- CopilotKit 开发台弹窗：通过 showDevConsole={false} 与 enableInspector={false} 禁用开发台，避免 SyntaxError 弹窗。
- 服务端 Key 探测：首次进入页面通过 /api/copilotkit 拉取服务端 Key 配置状态，避免空响应导致解析异常。
- 浏览器 Key 存储：用户可在面板保存 Key，存储在 localStorage；为空时退回服务端 Key。
- 空响应修复：对 /api/copilotkit 的空响应进行包装，避免 urql 解析错误。
- 规则系统调试：通过控制台输出规则匹配过程，便于调试对话模式分流逻辑。

章节来源
- [components/CopilotProviders.tsx:49-156](file://components/CopilotProviders.tsx#L49-L156)

## 结论
本项目通过 CSS 变量与 keyframes 实现统一的赛博朋克主题，结合 CopilotKit 的聊天 UI 与 Function Calling 能力，提供了"结构化卡片 + 流式回复"的丰富交互体验。新增的规则系统确保了对话模式的智能分流，包括卡片式对话模式与自由格式对话模式的明确决策标准和对话策略改进。AiBot 的设计规范、动画与响应式布局确保在不同设备与场景下保持一致的视觉与交互质量。通过 resumeData 驱动的卡片系统和完善的规则引擎，能够灵活扩展内容与样式覆盖，便于二次开发与主题定制。

## 附录
- CSS 变量使用示例：:root 定义 --bg/--surface/--accent/--text/--border 等，全局生效。
- 动画配置：fcBlink、orbPulse、fadeUp、pulse、fabCyberPulse、barIn 等 keyframes。
- 交互行为：复制/再生/点赞/踩、空回复提示、平滑滚动、FAB 展开。
- 规则系统：卡片式对话模式与自由格式对话模式的分流机制。
- 多轮追问策略：四类模糊情形的识别与处理方法。

章节来源
- [app/globals.css:2-12](file://app/globals.css#L2-L12)
- [app/globals.css:92-101](file://app/globals.css#L92-L101)
- [app/globals.css:516-550](file://app/globals.css#L516-L550)
- [components/AiBot.tsx:1545-1591](file://components/AiBot.tsx#L1545-L1591)
- [components/Project2Page.tsx:163-171](file://components/Project2Page.tsx#L163-L171)