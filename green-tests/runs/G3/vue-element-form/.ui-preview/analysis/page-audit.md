# 商户结算配置页审计（src/pages/SettlementForm.vue）

## 主任务

商务同事为一家商户一次性、完整、准确地录入/修改结算配置（约 29 个字段），提交后生效。低中频操作（每商户偶尔一次），准确性 > 速度。

## 操作分级

| 操作 | 频率 | 风险 |
|---|---|---|
| 填写/修改字段并提交 | 高 | 中（费率、卡号错了影响打款） |
| 清空（reset） | 低 | 危险：一键清空全部 29 个字段，无确认、不可撤销，且紧邻主按钮（红色 danger 按钮） |

## 任务链现状

进入页面 → 从上到下扫 29 个无分组字段 → 填写 → 点提交 → 遇到 window.alert 逐个报错 → 回头找字段 → 再提交。无分组、无锚点，出错定位靠肉眼。

## 信息分级（分组）

1. 商户基本信息（决策必需）：merchantNo、merchantName、shortName、merchantType、creditCode、industry
2. 法人与联系人：legalName、legalIdNo、legalPhone、contactEmail、servicePhone
3. 经营地址：region、address
4. 结算账户（高风险核心）：accountType、accountName、bankCardNo、bankName、branchName、bankCode
5. 结算规则（高风险核心）：settleCycle、feeRate、minSettleAmount、autoWithdraw、withdrawPhone、deposit
6. 发票信息：invoiceType、invoiceTitle、taxNo（invoiceType=NONE 时后两项可收起）
7. 备注（辅助）：remark

merchantNo 为系统编号，接近元数据（编辑态应只读展示）。

## 状态盘点（现状）

- 正常：有（写死初始数据）。
- 加载：无（数据硬编码在组件里）。
- 空：无（reset 会把布尔字段清成 false、字符串清空，但无"新建商户"语义）。
- 错误：window.alert 弹窗，仅 3 条校验（商户名、卡号、费率数字），其余字段无校验。
- 成功：window.alert('保存成功')，无下一步指引。
- 禁用/无权限：无。

## 问题清单（对照 ux-rules.md）

1. 长表单未按业务含义分组，29 个字段单列平铺，认知负担极大（信息架构）。
2. 校验用 window.alert，不就近、无修复提示；提交才逐条报错，一次只报一个（错误预防）。
3. 绝大多数字段无任何校验（身份证、手机号、邮箱、信用代码、卡号、金额均裸输入）。
4. 危险操作"清空"与主操作"提交"相邻，无确认、无后果说明、不可撤销（操作效率/危险操作）。
5. 结算关键信息（费率、卡号、周期）提交前无核对/预览步骤（错误预防）。
6. 无加载/空/错误/成功状态设计；数据写死，无法体现异步语义。
7. 发票"不开票"时仍显示抬头/税号；自动提现关闭时仍显示提现预留手机号（渐进披露缺失）。
8. label 宽度 140px + 单列 900px，右侧大量空白浪费，纵向滚动 3 屏以上。
9. 纳税人识别号与统一社会信用代码通常一致，无带入辅助，重复录入易错。

## 必须保留的业务行为（落地红线）

- 全部 29 个字段与其 v-model 键名、选项枚举值不变。
- 提交必填约束：merchantName、bankCardNo；feeRate 必须是数字（可加强，不可放松）。
- 清空能力保留（可加确认）。
- 预览阶段一律模拟数据，不接任何真实接口。
