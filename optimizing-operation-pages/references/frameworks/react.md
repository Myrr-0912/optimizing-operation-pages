# React 生态适配

## 组件来源优先级（严格按序）

1. **复用项目现有组件库**（project-profile.json 的 componentLibs）：AntD 项目就用 AntD 实现五套风格，通过 `ConfigProvider` token / `theme.darkAlgorithm` 做风格差异，不引入平行组件库。
2. 现有库确实无法表达目标风格 → 在 `.ui-preview/` 内安装**兼容 React 版本**的其他开源库（先查 peerDependencies）。
3. Headless（Radix/Headless UI/TanStack Table）+ 风格包 token 自写样式。
4. 语义化 HTML + CSS 兜底。

## AntD 风格差异化要点

- 密度：`ConfigProvider componentSize` + token（`fontSize`、`controlHeight`、`padding`）。
- 形态：token `borderRadius`；边框/阴影用 `colorBorderSecondary`、`boxShadow`。
- 暗色：`theme.darkAlgorithm` + 状态色 token 覆盖。
- 五套方案 = 五个 ConfigProvider 配置 + 不同布局骨架，**不是**五份全量复制的组件代码；公共逻辑放 `shared/`。

## 预览工程注意

- `.ui-preview/package.json` 里 React 版本对齐项目主版本（17/18/19），避免与将来落地代码不一致。
- 项目用 TypeScript 时预览也用 TSX（把壳文件后缀与配置改为 TS 即可）。
- 落地阶段：把选定方案的组件移植回真实 `src/` 时，替换 mock 数据源为真实数据流（props/hooks/请求层），保持原接口协议与权限判断不动。
