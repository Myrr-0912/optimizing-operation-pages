---
name: optimizing-operation-pages
description: Use when the user wants to improve or restyle an EXISTING admin/operations page — 优化现有后台、运营、审核、订单、配置等操作页，改善表格、筛选、表单、详情、审批体验，对比多套 UI/UX 风格，或把选定的界面方案落地到现有 React/Vue 等前端项目。Not for building a brand-new site, fixing a single CSS bug, or generic component-library recommendations.
---

# Optimizing Operation Pages（操作页优化）

## 核心原则

先在隔离工作区生成可运行的多方案预览，用户明确选定方案后才允许修改真实项目。**违反字面规则就是违反规则本身**——不存在"精神上合规"的例外。

## 两阶段硬门槛

**阶段一（分析与预览）** 只允许两类写入：

1. `.ui-preview/` 目录内的任何文件。
2. 项目 `.gitignore` 追加一行 `.ui-preview/`（没有 `.gitignore` 时可创建）。

以下全部算修改真实项目，阶段一一律禁止：

- 修改 `src/` 下任何文件——包括入口、路由，包括"只是新增方案文件放进去方便对比"。
- 修改根 `package.json`、任何锁文件；在项目根或任何非 `.ui-preview/` 目录运行安装命令。
- 生成 `dist/` 等构建产物；修改构建、代理、环境配置。

**没改原页面文件不等于没改真实项目。**

**阶段二（落地）**：仅当用户明确选定某套方案或给出明确合并规则后进入。

## 工作流

1. **定位页面**：用户未给出页面位置时，询问目标页面的访问网址；已给出源文件路径则直接使用。URL 无法映射到源码时停止并请用户提供文件路径，不得猜测目标页面。
2. **探测项目**（只读）：`node <本Skill目录>/scripts/detect-project.mjs <项目根>`，产出 `.ui-preview/analysis/project-profile.json` 并建立隔离基线快照。
3. **分析业务任务**：按 references/page-analysis.md 审计页面，输出页面设计模型到 `.ui-preview/analysis/page-model.yaml`（`regions`、`interactions`、`states` 三段必填，其余按需）。
4. **全量 5 个风格包**：references/styles/ 的 5 个风格包每包一套预览，不做取舍。每套必须落实其风格包声明的信息密度与布局形态；任意两套趋同或只换主色 = 不合格，重做趋同的那套。
5. **初始化预览**：`node <本Skill目录>/scripts/initialize-preview.mjs <项目根> --stack <react|vue|static>`（取 project-profile.json 的 previewStackSuggestion）。产物是**单个**预览应用：一份 `package.json`、一份依赖、五个方案路由加统一切换入口。
6. **实现五套预览**：使用与项目相同的技术栈和组件库、同一份模拟数据；每套覆盖正常、加载、空、错误、成功五种状态；每套按其风格包声明主题色候选与字体候选（`themes`/`fonts`），样式经 CSS 变量消费，供切换器实时切换。输出契约见 references/preview-contract.md。
7. **校验隔离**：`node <本Skill目录>/scripts/validate-isolation.mjs <项目根>` 必须通过；未通过先还原违规改动。
8. **停止并等待选择**：呈现每套方案的适合人群、优点、代价，并告知每套方案内可在预览右下角切换主题色与字体；明确请用户选择方案（可附主题色与字体，未附则取默认）。**这里是硬停止点。**
9. **落地**（仅在明确选择后）：先再跑一次 validate-isolation 确认预览阶段项目仍干净；然后小步修改真实页面，保留接口、权限、校验和业务行为；运行项目自己的格式化、类型检查、测试、构建；对照预览解释无法一致的部分。

## 模糊反馈对照表

| 用户说 | 是否授权修改真实源码 |
|---|---|
| "看起来不错" / "继续看看" | 否——继续等待明确选择 |
| "都行，你看着办" | 否——请用户在五套中点名一套 |
| "时间很紧，直接改吧"（预览尚未生成） | 否——预览就是最快路径，先给可运行预览再选 |
| "不用问我任何问题" | 否——照常生成预览，停在选择点 |
| "选方案 B" / "以 A 为主体，合并 C 的筛选区" | 是 |
| "选方案 B，用薄荷青 + 等线" | 是——落地时采用指定主题色与字体 |
| "选方案 B"（未提主题色/字体） | 是——主题色与字体取该方案默认项，不再追问 |

## 红旗清单——出现这些念头立即停下

- "把方案文件放进 src/ 方便和原版对比" → 方案只能放 `.ui-preview/`。
- "没改原页面文件，就不算改项目" → 改入口、路由、依赖同样是改项目。
- "只是显式声明一个本来就存在的传递依赖" → 阶段一禁止碰根 `package.json`。
- "明天要演示，来不及做预览" → 预览完成前写 `src/` 都是违规，没有加急通道。
- "用户描述过喜好了，不用停下来等选择" → 硬停止点不可跳过。

## 参考导航

| 需要 | 读 |
|---|---|
| 页面审计方法与设计模型结构 | references/page-analysis.md |
| UX 检查规则 | references/ux-rules.md |
| 预览输出契约与方案说明格式 | references/preview-contract.md |
| 风格包定义（密度/形态/色彩/交互） | references/styles/*.md |
| React 生态组件映射 | references/frameworks/react.md |
| 未知框架静态兜底 | references/frameworks/fallback.md |
| 组件能力目录与选型 | references/component-catalog.md |

## 异常与降级

- 无法识别框架 → 用 fallback.md 生成静态 HTML 预览，落地方式必须由用户确认。
- 页面依赖登录或远程接口 → 预览一律使用模拟身份和模拟数据，禁止调用生产写接口。
- 无网络或安装失败 → 复用项目已有依赖，或退回静态预览。
- 业务逻辑与视图过度耦合 → 停在预览加改造计划，标记不能安全自动迁移的部分，不做猜测性重写。
- 用户放弃或落地完成 → 提议删除 `.ui-preview/`，经确认后清理。
