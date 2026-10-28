# 预览输出契约

## 结构

`.ui-preview/` 是**单个**预览应用：一份 `package.json`、一份依赖、一个 dev server。五套方案（从 references/styles/ 的 6 个风格包中按页面类型选 5 个，各出一套）= 五个路由（`#/<variant-id>`），共用右下角切换器（壳已内置）。

```text
.ui-preview/
├── analysis/            # project-profile.json、baseline-hashes.json、page-audit.md、page-model.yaml
├── mock/                # 五套方案共用的模拟数据
├── variants/
│   ├── index.jsx|js     # 注册五套方案（static 壳为 manifest.js）
│   └── <variant-id>/    # 每套方案一个目录
├── shared/              # 可复用的格式化/字典/公共组件
├── preview-manifest.json
└── (壳文件：index.html、src/、package.json、vite.config.js)
```

## 每套方案必须满足

1. 与项目相同的框架和组件库（无组件库时按风格包选兼容开源实现，依赖只装在 `.ui-preview/`）。
2. 同一份 `mock/` 数据，数据只需覆盖交互状态，不必贴近真实业务。
3. 覆盖五种状态：正常、加载、空、错误、成功（用切换器或模拟延时可触达，不能只写死正常态）。
4. 保留目标页面全部核心业务任务——砍功能不是简化。
5. 禁止调用任何生产接口；读取型接口也走模拟层。
6. 声明该方案风格包定义的主题色候选与字体候选（见下节），样式实现必须消费 CSS 变量，保证切换器实时生效。

## 主题色与字体切换

每套方案注册时携带 `themes` 与 `fonts` 数组（取值来自对应风格包 md 的候选表，第一项为默认）：

```js
{
  id: 'enterprise-dense',
  title: '企业高密度',
  component: EnterpriseDense,
  themes: [
    { id: 'classic-blue', title: '经典蓝', vars: {
      '--op-primary': '#1677FF', '--op-primary-hover': '#4096FF',
      '--op-primary-active': '#0958D9', '--op-primary-soft': '#E6F4FF'
    } }
  ],
  fonts: [
    { id: 'yahei', title: '雅黑', vars: { '--op-font-family': '-apple-system, "Segoe UI", "Microsoft YaHei", "PingFang SC", sans-serif' } }
  ]
}
```

规则：

- 壳负责把选中项的 `vars` 应用到方案根节点并持久化选择（localStorage，按方案隔离）；方案代码**不自建**切换 UI。
- 方案样式必须通过 `var(--op-primary)` 等变量引用主色衍生态与字体；根节点设置 `font-family: var(--op-font-family, <默认栈>)`。command-center 的 KPI 数字额外消费 `--op-font-numeric`。
- 使用组件库时把变量桥接进主题配置（如 AntD `ConfigProvider` 的 `colorPrimary` 取默认主题值，同时用 CSS 变量覆盖衍生样式），至少保证主操作、链接、选中态、soft 底色随切换变化。
- 字体候选一律使用目标平台系统自带字体（雅黑/等线/宋体/Consolas 等），零加载零安装；差异必须体现在中文主字体上（页面以中文为主，仅换西文字体等于没换）。回退栈保证 macOS 等缺字体环境自动降级，不算缺陷。
- 未声明 `themes`/`fonts` 的方案，切换器不显示对应面板（向后兼容）。
- 主题色候选是**方案内**的自由度：跨方案差异仍按下节的密度/形态标准衡量，只换主色 = 不合格。

## 风格包选取与差异下限

按 page-model.yaml 的 `pageType` 从 6 个风格包中去掉 1 个：

| pageType | 去掉 | 依据 |
|---|---|---|
| `list`（订单、审核、财务这类只看一张表的处理页） | cloudflare-console | 其「不适用」：单一业务、只看一张表 |
| `form` | command-center | 其「不适用」：数据录入为主的表单页 |
| `workflow`（审批、多步流程） | command-center | 同上，以录入和审批为主 |
| `detail` | command-center | 详情页不需要实时值守 |
| `master-detail` | material-friendly | 其「不适用」：单屏高密度处理台 |
| `dashboard` | material-friendly | 其「不适用」含报表页 |

- 页面实际情况与上表冲突时（如 list 页其实属于多模块平台），可以改去掉另一个，但必须在 `preview-manifest.json` 的 `excluded` 和方案说明里写明理由。
- 被去掉的那个不出预览，其余 5 个不做取舍与合并。
- 每套必须落实其风格包声明的信息密度与布局骨架；任意两套在密度、形态、布局、操作组织上趋同或只换主色 = 不合格，重做趋同的那套。

## 方案说明（呈现给用户时）

每套方案给四行：**适合人群**（谁的工作流受益）、**主要变化**（对比原页面的 2-3 条）、**优点**、**代价**（学习成本/空间占用/信息密度损失）。先说明本次去掉的风格包及原因（一句话）。同时告知：每套方案右下角可切换主题色与字体，请一并试用。最后明确问："请选择一套方案（可注明主题色和字体），或指定以某套为主体合并另一套的哪个区域。"未注明时取该方案的默认主题色与字体。

## preview-manifest.json

```json
{
  "stack": "react",
  "page": "src/pages/OrdersPage.jsx",
  "variants": [
    {
      "id": "enterprise-dense",
      "title": "企业高密度",
      "stylePack": "enterprise-dense",
      "themes": ["classic-blue", "indigo", "teal-deep"],
      "fonts": ["yahei", "dengxian"]
    }
  ],
  "excluded": { "stylePack": "cloudflare-console", "reason": "pageType=list：单表处理页，资源级导航多余" }
}
```
