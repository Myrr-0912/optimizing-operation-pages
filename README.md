# optimizing-operation-pages

Claude Code skill：优化现有后台 / 运营 / 审核 / 订单 / 配置等操作页。先在隔离的 `.ui-preview/` 工作区生成多套可运行的 UI/UX 方案预览，用户选定后再落地到真实 React / Vue 项目。

## 目录

- `optimizing-operation-pages/` — skill 本体（`SKILL.md`、`references/`、`scripts/`、`assets/preview-shells/`）
- `fixtures/` — 用于测试的最小示例项目（React + AntD 订单页、Vue + Element Plus 表单页）
- `baseline-tests/` — RED 基线：无 skill 时的行为记录与结论
- `green-tests/` — GREEN 验证：启用 skill 后的行为记录与产物（含各 run 的 `.ui-preview/`）

## 安装

把 `optimizing-operation-pages/` 目录复制到 `~/.claude/skills/`（或项目内 `.claude/skills/`）即可。
