# 页面审计与页面设计模型

## 审计顺序（先任务，后外观）

1. **主任务**：用户进这个页面最想完成什么？一句话写出来。写不出来 = 信息不足，去问用户。
2. **操作分级**：列出全部操作，标注高频 / 低频 / 危险。危险操作 = 不可逆或影响他人（删除、关闭、拉黑、退款）。
3. **任务链**：查询 → 筛选 → 查看 → 编辑/审批 → 提交 → 反馈，画出现状路径，数点击次数。
4. **信息分级**：每个字段标注 决策必需 / 辅助 / 技术元数据（UUID、同步标记等归为元数据，默认收起）。
5. **状态盘点**：正常、加载、空、错误、禁用、无权限、成功——现状页面各自长什么样？缺哪个？
6. **问题清单**：按 references/ux-rules.md 逐条检查，记录具体证据（如"删除按钮与普通操作相邻且确认文案只有两个字"）。

## 页面设计模型（.ui-preview/analysis/page-model.yaml）

定位是**建议结构的分析文档**，不是强制 schema：按页面实际情况增删字段。只有三段必填——它们是五套预览和最终落地的共同依据：

```yaml
pageType: list | form | detail | master-detail | workflow | dashboard
tasks:                # 建议
  - goal: 找到并处理异常订单
    frequency: high
regions:              # 必填：页面区域与层级
  - id: filter
    role: 查询与筛选
    fields: [...]
  - id: table
    role: 数据主体
    columns: [...]
interactions:         # 必填：关键交互及其规则
  - id: batch-close
    trigger: 选中行后出现
    confirm: 必须，说明后果
states:               # 必填：每套预览都要实现的状态
  - normal
  - loading
  - empty
  - error
  - success
entities: ...         # 建议：字段、状态枚举、操作
constraints: ...      # 建议：权限、响应式、性能
```

## 停止条件

- 找不到页面源码、路由或截图 → 停止，列出缺什么，不生成误导性方案。
- 页面强依赖登录/远程接口 → 只读源码分析 + 模拟数据，禁止调生产接口。
