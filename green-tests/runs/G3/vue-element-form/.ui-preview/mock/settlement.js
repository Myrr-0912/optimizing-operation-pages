// 三套方案共用的模拟数据与模拟接口。禁止调用任何真实接口。

// 与原页面 src/pages/SettlementForm.vue 完全相同的字段键名与取值类型。
export const filledMerchant = {
  merchantNo: 'M20260455',
  merchantName: '杭州云栖优选贸易有限公司',
  shortName: '云栖优选',
  merchantType: 'COMPANY',
  creditCode: '91330106MA2CE55X0K',
  legalName: '沈立群',
  legalIdNo: '330106198804122417',
  legalPhone: '13957112288',
  contactEmail: 'finance@yunqi-mall.example.com',
  servicePhone: '0571-88221100',
  region: '浙江省杭州市西湖区',
  address: '文三西路 518 号云栖产业园 B 座 11 层',
  industry: 'FOOD',
  accountType: 'CORPORATE',
  accountName: '杭州云栖优选贸易有限公司',
  bankCardNo: '571908822110045678',
  bankName: '招商银行',
  branchName: '招商银行杭州文三支行',
  bankCode: '308331000516',
  settleCycle: 'T1',
  feeRate: '0.6',
  minSettleAmount: '100',
  invoiceType: 'SPECIAL',
  invoiceTitle: '杭州云栖优选贸易有限公司',
  taxNo: '91330106MA2CE55X0K',
  autoWithdraw: true,
  withdrawPhone: '13957112288',
  deposit: '20000',
  remark: ''
}

export const blankMerchant = Object.fromEntries(
  Object.entries(filledMerchant).map(([k, v]) => [k, typeof v === 'boolean' ? false : ''])
)

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * 模拟拉取结算配置。
 * scenario: normal | loading | empty | error
 */
export async function fetchSettlement(scenario = 'normal') {
  if (scenario === 'loading') return new Promise(() => {}) // 永不返回，用于演示加载态
  await delay(650)
  if (scenario === 'error') {
    const err = new Error('拉取结算配置失败：结算网关响应超时（模拟错误，可点击重试）')
    err.code = 'GATEWAY_TIMEOUT'
    throw err
  }
  if (scenario === 'empty') return { isNew: true, data: { ...blankMerchant } }
  return { isNew: false, data: { ...filledMerchant } }
}

/** 模拟保存。永远不会写任何真实系统。 */
export async function saveSettlement(payload) {
  await delay(900)
  return {
    ok: true,
    merchantNo: payload.merchantNo || '（新商户，提交后由系统分配）',
    savedAt: new Date().toLocaleString('zh-CN', { hour12: false })
  }
}
