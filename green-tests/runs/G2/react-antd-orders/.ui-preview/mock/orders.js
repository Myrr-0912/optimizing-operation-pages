// 三套方案共用的模拟数据层。数据结构与 src/mock/orders.js 完全一致，
// 额外支持 scenario 参数以触达 加载/空/错误 状态。禁止调用任何真实接口。
const STATUS = ['WAIT_PAY', 'PAID', 'SHIPPED', 'FINISHED', 'CLOSED', 'REFUNDING']
const CHANNEL = ['APP', 'H5', 'WXMP', 'PC']
const PAY = ['ALIPAY', 'WECHAT', 'BALANCE', 'UNIONPAY']
const NAMES = ['王小明', '李芳', '张伟', '刘洋', '陈静', '杨帆', '赵磊', '黄丽', '周杰', '吴敏']

function pad(n, w) {
  return String(n).padStart(w, '0')
}

export function buildRows() {
  const rows = []
  for (let i = 0; i < 87; i++) {
    const created = new Date(2026, 5, 1 + (i % 30), 8 + (i % 12), (i * 7) % 60)
    rows.push({
      id: 'f3a9c1e0-77b2-4d61-9c' + pad(i, 2) + '-8e21d4b0a1' + pad(i % 90, 2),
      orderNo: 'SO2026' + pad(60000 + i * 13, 6),
      outTradeNo: i % 3 === 0 ? '' : '4200' + pad(88800000 + i * 991, 9),
      customerName: NAMES[i % NAMES.length],
      customerPhone: '138' + pad((12345678 + i * 137) % 100000000, 8),
      skuCount: (i % 5) + 1,
      amount: ((i * 137) % 9000) + 59.9,
      discount: i % 4 === 0 ? ((i * 13) % 200) + 5 : 0,
      freight: i % 6 === 0 ? 0 : 12,
      status: STATUS[i % STATUS.length],
      channel: CHANNEL[i % CHANNEL.length],
      payType: PAY[i % PAY.length],
      syncFlag: i % 7 === 0 ? 0 : 1,
      riskLevel: i % 11 === 0 ? 'HIGH' : i % 5 === 0 ? 'MID' : 'LOW',
      remark: i % 9 === 0 ? '客户要求周末送货，电话联系不上，已发短信' : '',
      createdAt: created.toISOString(),
      updatedAt: new Date(created.getTime() + 3600 * 1000 * (i % 48)).toISOString()
    })
  }
  return rows
}

/**
 * scenario:
 *  - normal  正常返回 87 条（500ms 延时）
 *  - slow    长延时（6s），用于观察加载态
 *  - empty   返回空列表
 *  - error   拒绝，模拟接口 502
 */
export function fetchOrders(scenario = 'normal') {
  if (scenario === 'error') {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('订单服务暂时不可用（模拟 502 Bad Gateway）')), 600)
    )
  }
  if (scenario === 'empty') {
    return new Promise((resolve) => setTimeout(() => resolve([]), 400))
  }
  if (scenario === 'slow') {
    return new Promise((resolve) => setTimeout(() => resolve(buildRows()), 6000))
  }
  return new Promise((resolve) => setTimeout(() => resolve(buildRows()), 500))
}

export const STATUS_TEXT = {
  WAIT_PAY: '待支付',
  PAID: '已支付',
  SHIPPED: '已发货',
  FINISHED: '已完成',
  CLOSED: '已关闭',
  REFUNDING: '退款中'
}

// AntD Tag 预设色
export const STATUS_COLOR = {
  WAIT_PAY: 'orange',
  PAID: 'blue',
  SHIPPED: 'geekblue',
  FINISHED: 'green',
  CLOSED: 'default',
  REFUNDING: 'red'
}

export const PAY_TEXT = {
  ALIPAY: '支付宝',
  WECHAT: '微信',
  BALANCE: '余额',
  UNIONPAY: '银联'
}

export const RISK_TEXT = { HIGH: '高', MID: '中', LOW: '低' }
export const RISK_COLOR = { HIGH: '#ff4d4f', MID: '#faad14', LOW: '#52c41a' }

export const CHANNELS = CHANNEL
export const PAY_TYPES = PAY
export const RISK_LEVELS = ['HIGH', 'MID', 'LOW']
