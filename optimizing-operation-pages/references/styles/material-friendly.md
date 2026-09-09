# 风格包：material-friendly（圆润亲和）

**适用**：国际化产品、跨设备业务工具、面向非专职操作员的页面——亲和感与操作反馈优先，降低新手的紧张感。
**不适用**：单屏高密度处理台、需要打印/导出对齐的报表页。

## Design Token

| 维度 | 取值 |
|---|---|
| 信息密度 | 宽松：表格行高 48-52px，组件默认或 large size |
| 字号 | 正文 14px，辅助 12px，页面标题 20-22px（medium 字重） |
| 间距 | 基准 16px，区块间 24px |
| 圆角 | 明显：卡片 12-16px，按钮 20px+（胶囊或大圆角） |
| 边框 | 无边框，靠海拔（elevation）阴影分层：卡片 1 级，弹层 3 级 |
| 色彩 | 白/浅色底 + 饱和度中等的主色；主色的浅色容器（tinted container）做选中态和强调区底色 |
| 动效 | 充分：涟漪/按压反馈、展开收起 200-300ms 缓动，状态变化有过渡 |

## 主题色候选（3 选 1，默认第一个）

| id | 名称 | primary | hover | active | soft（浅色容器） |
|---|---|---|---|---|---|
| `material-blue` | Material 蓝（默认） | #1976D2 | #1565C0 | #0D47A1 | #E3F2FD |
| `material-teal` | 青绿 | #00897B | #00796B | #00695C | #E0F2F1 |
| `m3-purple` | M3 紫 | #6750A4 | #735EAD | #57458F | #EADDFF |

Material 系 hover/active 走加深方向（叠加暗色 state layer），与其他风格包相反，实现时注意。

## 字体候选（2 选 1，默认第一个；全部系统自带字体，零加载，中文差异肉眼可见）

| id | 名称 | font-family |
|---|---|---|
| `yahei` | 雅黑（默认） | -apple-system, "Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif |
| `dengxian` | 等线（更轻瘦） | "DengXian", "等线", "PingFang SC", "Microsoft YaHei", sans-serif |

macOS 无雅黑/等线时回退苹方，不算缺陷。

## 布局骨架

卡片流布局：页头（大标题 + 主操作 FAB 或醒目胶囊按钮）→ 筛选 chips 行（可滚动的圆角标签组，点选即过滤）→ 内容卡片（表格卡或列表卡，卡内自带工具行）→ 圆形分页/加载更多。移动端可退化为卡片列表。

## 组件规则

- **表格**：无竖线、宽行距、行 hover 整行浅色高亮；状态用 tinted 圆角 chip（浅底深字）；复选框、开关等控件偏大易点。
- **筛选**：filter chips 优先（常用条件一击切换），复杂条件收进"筛选"按钮弹出的底部抽屉/对话框。
- **表单/弹窗**：对话框圆角 16px+；输入框用 outlined 或 filled 风格、浮动 label；即时校验 + helper text。
- **操作层级**：主操作实心大圆角按钮（一个）；次操作 tonal（浅色容器底）；文字按钮兜底；危险操作红色 tonal + 确认对话框。
- **状态**：加载用圆形进度或骨架卡；空状态插画 + 引导按钮；成功用 snackbar（带撤销时限操作）。

## 实现映射

MUI：默认主题 + `shape.borderRadius: 12` + Chip/Snackbar/Dialog。AntD：`borderRadius: 12` + 大尺寸控件 + 自定义 chip 样式。Element Plus：round 属性 + 主题圆角变量。无组件库：CSS 变量 + box-shadow 分层 + 大圆角工具类。
