# 组件能力目录

按能力选组件，不按库选组件。本目录只记映射关系，不内置任何第三方源码；**安装前必须核验**：与项目框架主版本兼容、许可证（MIT/Apache 优先）、维护状态；不写死版本号，装在 `.ui-preview/` 内并保留其锁文件。

## 能力 → 实现映射

| 能力 | React 首选 | Vue 3 首选 | Headless/兜底 |
|---|---|---|---|
| 页面框架/导航 | AntD Layout、ProLayout | Element Plus Container | CSS Grid |
| 查询筛选（折叠/已选条件） | AntD Form + Tag / ProTable 内置 | EP Form + el-tag | 原生 form + details |
| 高密度表格（固定列/排序/选择） | AntD Table、TanStack Table | el-table、TanStack Vue | table + position:sticky |
| 卡片/统计摘要 | AntD Card/Statistic | el-card/el-statistic | CSS 卡片 |
| 表单（分组/分步/校验） | AntD Form/Steps | el-form/el-steps | 原生校验 API |
| 上传/动态字段 | AntD Upload/Form.List | el-upload | input[type=file] |
| 确认/撤销/Toast/进度 | AntD Modal/message/Progress | ElMessageBox/ElMessage | dialog 元素 |
| 主从视图/侧边详情 | AntD Drawer | el-drawer | 自绘侧栏 |
| 批量操作条 | 自绘浮动条 + Table rowSelection | 自绘 + el-table selection | 自绘 |
| 状态标签/徽标/时间线/空状态 | AntD Tag/Badge/Timeline/Empty | el-tag/el-badge/el-timeline/el-empty | CSS 徽标 |
| 图表 | ECharts、Recharts | ECharts | SVG 手绘简图 |

## 选型检查单（每次引入新库时）

- [ ] 项目现有库真的表达不了？（先试主题化）
- [ ] peerDependencies 与项目框架版本兼容
- [ ] 许可证允许商用
- [ ] 近 12 个月有维护活动（无网络时降级：复用已有依赖或原生实现）
- [ ] 支持键盘操作与 ARIA（高密度表格与弹窗尤其）
- [ ] 只装进 `.ui-preview/`，落地阶段再经用户同意进真实依赖
