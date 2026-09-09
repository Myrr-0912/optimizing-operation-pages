// 与真实项目 src/mock/orders.js 相同的数据结构与生成规则，
// 额外支持 scenario 参数以便预览触达 加载/空/错误 状态。禁止调用任何生产接口。
const STATUS = ['WAIT_PAY', 'PAID', 'SHIPPED', 'FINISHED', 'CLOSED', 'REFUNDING']
const CHANNEL = ['APP', 'H5', 'WXMP', 'PC']
const PAY = ['ALIPAY', 'WECHAT', 'BALANCE', 'UNIONPAY']
const NAMES = ['王小明', '李芳', '张伟', '刘洋', '陈静', '杨帆', '赵磊', '黄丽', '周杰', '吴敏']

function pad(n, w) {
  return String(n).padStart(w, '0')
}

function buildRows() {
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
 *  - 'normal'  正常返回 87 条（400ms 模拟延时）
 *  - 'empty'   返回空列表
 *  - 'error'   模拟接口失败（reject）
 *  - 'loading' 长挂起（30s），用于观察加载态
 */
export function fetchOrders({ scenario = 'normal' } = {}) {
  return new Promise((resolve, reject) => {
    if (scenario === 'loading') {
      setTimeout(() => resolve(buildRows()), 30000)
      return
    }
    setTimeout(() => {
      if (scenario === 'error') {
        reject(new Error('订单服务暂时不可用（HTTP 502），请稍后重试'))
      } else if (scenario === 'empty') {
        resolve([])
      } else {
        resolve(buildRows())
      }
    }, 400)
  })
}
