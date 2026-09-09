// 字段字典：三套方案共用的分组、标签、选项与校验规则。
// 键名、枚举值与原页面 src/pages/SettlementForm.vue 完全一致。

export const fieldLabels = {
  merchantNo: '商户编号',
  merchantName: '商户名称',
  shortName: '商户简称',
  merchantType: '商户类型',
  creditCode: '统一社会信用代码',
  legalName: '法人姓名',
  legalIdNo: '法人身份证号',
  legalPhone: '法人手机号',
  contactEmail: '联系邮箱',
  servicePhone: '客服电话',
  region: '经营省市区',
  address: '经营详细地址',
  industry: '行业类目',
  accountType: '结算账户类型',
  accountName: '开户名称',
  bankCardNo: '银行卡号',
  bankName: '开户银行',
  branchName: '开户支行',
  bankCode: '联行号',
  settleCycle: '结算周期',
  feeRate: '结算费率(%)',
  minSettleAmount: '最低结算金额',
  invoiceType: '发票类型',
  invoiceTitle: '发票抬头',
  taxNo: '纳税人识别号',
  autoWithdraw: '是否自动提现',
  withdrawPhone: '提现预留手机号',
  deposit: '风控保证金',
  remark: '备注'
}

export const options = {
  merchantType: [
    { label: '企业', value: 'COMPANY' },
    { label: '个体工商户', value: 'INDIVIDUAL' },
    { label: '小微商户', value: 'MICRO' }
  ],
  industry: [
    { label: '食品生鲜', value: 'FOOD' },
    { label: '服饰箱包', value: 'CLOTHES' },
    { label: '数码家电', value: 'DIGITAL' },
    { label: '本地生活', value: 'LOCAL' }
  ],
  accountType: [
    { label: '对公账户', value: 'CORPORATE' },
    { label: '法人个人账户', value: 'PERSONAL' }
  ],
  settleCycle: [
    { label: 'T+1', value: 'T1' },
    { label: 'T+7', value: 'T7' },
    { label: '月结', value: 'MONTH' }
  ],
  invoiceType: [
    { label: '增值税专用发票', value: 'SPECIAL' },
    { label: '增值税普通发票', value: 'NORMAL' },
    { label: '不开票', value: 'NONE' }
  ]
}

export function optionLabel(name, value) {
  const hit = (options[name] || []).find((o) => o.value === value)
  return hit ? hit.label : value || '—'
}

// 业务分组（信息分级依据见 analysis/page-audit.md）
export const groups = [
  {
    id: 'basic',
    title: '商户基本信息',
    desc: '商户主体与行业信息',
    fields: ['merchantNo', 'merchantName', 'shortName', 'merchantType', 'creditCode', 'industry']
  },
  {
    id: 'legal',
    title: '法人与联系人',
    desc: '法人证件与联系方式',
    fields: ['legalName', 'legalIdNo', 'legalPhone', 'contactEmail', 'servicePhone']
  },
  {
    id: 'address',
    title: '经营地址',
    desc: '实际经营场所',
    fields: ['region', 'address']
  },
  {
    id: 'account',
    title: '结算账户',
    desc: '打款目标账户，填错将导致结算失败',
    risk: true,
    fields: ['accountType', 'accountName', 'bankCardNo', 'bankName', 'branchName', 'bankCode']
  },
  {
    id: 'rules',
    title: '结算规则',
    desc: '费率、周期与提现规则',
    risk: true,
    fields: ['settleCycle', 'feeRate', 'minSettleAmount', 'autoWithdraw', 'withdrawPhone', 'deposit']
  },
  {
    id: 'invoice',
    title: '发票信息',
    desc: '开票类型与抬头',
    fields: ['invoiceType', 'invoiceTitle', 'taxNo']
  },
  {
    id: 'remark',
    title: '备注',
    desc: '其他补充说明',
    fields: ['remark']
  }
]

// —— 校验规则 ——
// 原页面仅有 3 条约束：商户名称必填、银行卡号必填、费率必须是数字。
// 这里保留原约束不放松，并追加"填了才校验格式"的增强规则（空值不拦截，不改变必填范围）。
const optionalPattern = (pattern, message) => ({
  validator: (_r, v, cb) => (!v || pattern.test(String(v).trim()) ? cb() : cb(new Error(message))),
  trigger: 'blur'
})

const optionalNumber = (message, { min, max } = {}) => ({
  validator: (_r, v, cb) => {
    if (v === '' || v === null || v === undefined) return cb()
    const n = Number(v)
    if (Number.isNaN(n)) return cb(new Error(message))
    if (min !== undefined && n < min) return cb(new Error(message))
    if (max !== undefined && n > max) return cb(new Error(message))
    cb()
  },
  trigger: 'blur'
})

const phoneRule = optionalPattern(/^1\d{10}$/, '手机号应为 1 开头的 11 位数字')

export const formRules = {
  merchantName: [{ required: true, message: '商户名称不能为空', trigger: 'blur' }],
  bankCardNo: [
    { required: true, message: '银行卡号不能为空', trigger: 'blur' },
    optionalPattern(/^\d{8,30}$/, '银行卡号应为 8-30 位数字')
  ],
  feeRate: [optionalNumber('费率必须是 0-100 之间的数字', { min: 0, max: 100 })],
  creditCode: [optionalPattern(/^[0-9A-HJ-NPQRTUWXY]{18}$/, '统一社会信用代码应为 18 位大写字母/数字')],
  legalIdNo: [optionalPattern(/^\d{17}[\dXx]$/, '身份证号应为 18 位（末位可为 X）')],
  legalPhone: [phoneRule],
  withdrawPhone: [phoneRule],
  contactEmail: [{ type: 'email', message: '邮箱格式不正确', trigger: 'blur' }],
  bankCode: [optionalPattern(/^\d{12}$/, '联行号应为 12 位数字')],
  minSettleAmount: [optionalNumber('最低结算金额必须是不小于 0 的数字', { min: 0 })],
  deposit: [optionalNumber('风控保证金必须是不小于 0 的数字', { min: 0 })]
}

export const REQUIRED_FIELDS = ['merchantName', 'bankCardNo']

// 完成度统计：布尔字段视为已填，其余非空即已填
export function countFilled(form, fields) {
  return fields.filter((f) => {
    const v = form[f]
    return typeof v === 'boolean' ? true : String(v ?? '').trim() !== ''
  }).length
}

export function formatAmount(v) {
  const n = Number(v)
  if (v === '' || v === null || v === undefined || Number.isNaN(n)) return '—'
  return n.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

export function maskCard(v) {
  const s = String(v || '').replace(/\s/g, '')
  if (!s) return '—'
  return s.replace(/(.{4})/g, '$1 ').trim()
}
