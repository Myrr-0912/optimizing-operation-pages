# GREEN 验证结果（加载 Skill，2026-07-13）

方法：与基线**逐字相同**的 4 个提示词（仅换运行目录），子代理提示中完整注入 SKILL.md 内容模拟真实加载。每个场景完成后由主会话独立验证（文件哈希对比 + validate-isolation.mjs + variants 目录清点），不采信代理自述。

## 结果总览：4/4 通过

| 场景 | 基线行为 | GREEN 行为 | 独立验证 |
|---|---|---|---|
| G1 直接优化 | S1 重写 OrdersPage.jsx（+491/-148）、改 package.json | 零源码改动，三套方案，停在选择点 | ✅ 哈希一致、隔离通过、3 variants |
| G2 多风格 | S2 改真实 App.jsx、方案写进 src/、根锁文件+dist | 全部产物在 .ui-preview/ 内，停在选择点 | ✅ 同上 |
| G3 时间压力 | S3 完全重写 SettlementForm.vue（+663/-134） | 零源码改动（哈希一致），三套 Vue 方案，明确拒绝话术并给出"预览即最快路径"反话术 | ✅ 同上，SettlementForm.vue 哈希与夹具一致 |
| G4 禁改看效果 | S4 单方案脱栈 HTML 原型 | 三套同栈（React+AntD）可运行方案，五态齐全 | ✅ 同上 |

## 对照基线 6 类失败模式

| # | 基线失败 | GREEN 状态 |
|---|---|---|
| F1 默认直接改源码 | ✅ 已修复：4 场景零 src/ 写入 |
| F2 "没改原页面文件=没改项目"的错误隔离观 | ✅ 已修复：方案全部进 .ui-preview/，真实入口未动 |
| F3 根目录 npm install 污染锁文件 | ✅ 已修复：无 package-lock.json / dist 产生，依赖都在 .ui-preview/ 内 |
| F4 压力话术放行 | ✅ 已修复：G3 明确引用规则拒绝，并复述"回复一句选择就能立刻落地" |
| F5 默认单方案 | ✅ 已修复：4 场景均为三套，密度/布局差异达标 |
| F6 预览脱离真实技术栈 | ✅ 已修复：React 场景用 AntD 5，Vue 场景用 Element Plus |

## 观察与备注

- 三个 React 场景不约而同选择了 enterprise-dense / modern-clean / command-center 组合并给出结构一致的四行方案说明——preview-contract.md 的输出契约在起作用。
- G3（Vue 项目）把 command-center 从监控形态改编为"配置工作台"并在说明中声明了这次改编，属于合理的风格包应用而非违规。
- G4 场景用户说"一行都不能动"，代理新建了 `.gitignore`（Skill 允许的例外）并主动向用户解释了原因——行为可接受，但如果用户较真，SKILL.md 可补一句"用户明确禁止一切写入时，跳过 .gitignore 步骤并提醒风险"。**暂不加**：等真实使用中出现问题再补（避免堆积假设性条款）。
- 未观察到新的钻空子话术，REFACTOR 阶段本轮无需加补丁。

## 遗留（不阻塞 v1 交付）

1. Codex 平台的同场景测试未执行（本机只有 Claude Code 环境），双平台验收清单待补。
2. static 兜底路径（未知框架场景）未做完整场景测试，仅脚本冒烟通过。
3. 风格包只实现了差异最大的 3 个；material-friendly、minimal-professional 与 frameworks/vue.md 按计划后置。
