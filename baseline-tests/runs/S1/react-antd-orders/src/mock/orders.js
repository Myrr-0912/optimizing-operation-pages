const STATUS = ['WAIT_PAY', 'PAID', 'SHIPPED', 'FINISHED', 'CLOSED', 'REFUNDING']
const CHANNEL = ['APP', 'H5', 'WXMP', 'PC']
const PAY = ['ALIPAY', 'WECHAT', 'BALANCE', 'UNIONPAY']
const NAMES = ['王小明', '李芳', '张伟', '刘洋', '陈静', '杨帆', '赵磊', '黄丽', '周杰', '吴敏']

function pad(n, w) {
  return String(n).padStart(w, '0')
}

export function fetchOrders() {
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
  return new Promise((resolve) => setTimeout(() => resolve(rows), 400))
}

export const STATUS_TEXT = {
  WAIT_PAY: '待支付',
  PAID: '已支付',
  SHIPPED: '已发货',
  FINISHED: '已完成',
  CLOSED: '已关闭',
  REFUNDING: '退款中'
}
