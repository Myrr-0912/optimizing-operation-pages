export const STATUS_TEXT = {
  WAIT_PAY: '待支付',
  PAID: '已支付',
  SHIPPED: '已发货',
  FINISHED: '已完成',
  CLOSED: '已关闭',
  REFUNDING: '退款中'
}

// AntD Tag 预设色，兼容亮/暗主题
export const STATUS_COLOR = {
  WAIT_PAY: 'gold',
  PAID: 'blue',
  SHIPPED: 'cyan',
  FINISHED: 'green',
  CLOSED: 'default',
  REFUNDING: 'volcano'
}

export const RISK_TEXT = { HIGH: '高风险', MID: '中风险', LOW: '低' }
export const RISK_COLOR = { HIGH: 'red', MID: 'orange', LOW: 'default' }

export const PAY_TEXT = { ALIPAY: '支付宝', WECHAT: '微信', BALANCE: '余额', UNIONPAY: '银联' }
export const CHANNEL_TEXT = { APP: 'APP', H5: 'H5', WXMP: '小程序', PC: 'PC' }

export const STATUS_OPTIONS = Object.entries(STATUS_TEXT).map(([value, label]) => ({ value, label }))
export const CHANNEL_OPTIONS = Object.entries(CHANNEL_TEXT).map(([value, label]) => ({ value, label }))
export const PAY_OPTIONS = Object.entries(PAY_TEXT).map(([value, label]) => ({ value, label }))
export const RISK_OPTIONS = [
  { value: 'HIGH', label: '高风险' },
  { value: 'MID', label: '中风险' },
  { value: 'LOW', label: '低' }
]
