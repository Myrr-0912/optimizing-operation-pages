// 三套方案共用的字典与格式化工具。
export const STATUS_TEXT = {
  WAIT_PAY: '待支付',
  PAID: '已支付',
  SHIPPED: '已发货',
  FINISHED: '已完成',
  CLOSED: '已关闭',
  REFUNDING: '退款中'
}

// AntD Tag 预设色（浅底深字）
export const STATUS_COLOR = {
  WAIT_PAY: 'gold',
  PAID: 'blue',
  SHIPPED: 'geekblue',
  FINISHED: 'green',
  CLOSED: 'default',
  REFUNDING: 'volcano'
}

// 暗色驾驶舱用的状态点颜色
export const STATUS_DOT = {
  WAIT_PAY: '#f5c518',
  PAID: '#4c9aff',
  SHIPPED: '#7a86ff',
  FINISHED: '#3ecf8e',
  CLOSED: '#8b93a7',
  REFUNDING: '#ff7452'
}

export const PAY_TEXT = { ALIPAY: '支付宝', WECHAT: '微信支付', BALANCE: '余额', UNIONPAY: '银联' }
export const CHANNEL_TEXT = { APP: 'APP', H5: 'H5', WXMP: '微信小程序', PC: 'PC' }
export const RISK_TEXT = { HIGH: '高风险', MID: '中风险', LOW: '低' }
export const RISK_COLOR = { HIGH: 'red', MID: 'orange', LOW: 'default' }

export const STATUS_OPTIONS = Object.keys(STATUS_TEXT).map((k) => ({ value: k, label: STATUS_TEXT[k] }))
export const CHANNEL_OPTIONS = ['APP', 'H5', 'WXMP', 'PC'].map((v) => ({ value: v, label: CHANNEL_TEXT[v] }))
export const PAY_OPTIONS = ['ALIPAY', 'WECHAT', 'BALANCE', 'UNIONPAY'].map((v) => ({ value: v, label: PAY_TEXT[v] }))
export const RISK_OPTIONS = ['HIGH', 'MID', 'LOW'].map((v) => ({ value: v, label: RISK_TEXT[v] }))

export function fmtAmount(v) {
  return '¥' + Number(v).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function fmtDateTime(v) {
  return v ? v.replace('T', ' ').slice(0, 16) : '—'
}

export function maskPhone(p) {
  return p && p.length === 11 ? p.slice(0, 3) + '****' + p.slice(7) : p || '—'
}

export function copyText(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(
    () => true,
    () => false
  )
    }
  } catch (e) {
    /* ignore */
  }
  return Promise.resolve(false)
}
