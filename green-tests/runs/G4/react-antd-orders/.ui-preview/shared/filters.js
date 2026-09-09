import dayjs from 'dayjs'

// 与原页面 doFilter 等价的过滤逻辑（保留全部 9 项筛选能力）。
// keyword 聚合命中 订单号/外部交易号/客户姓名/手机号 任一字段；
// 各独立字段仍可单独传入（enterprise-dense 的“更多筛选”里保留独立输入）。
export function filterOrders(rows, f = {}) {
  const kw = (f.keyword || '').trim()
  return rows.filter((r) => {
    if (
      kw &&
      !(
        r.orderNo.includes(kw) ||
        (r.outTradeNo && r.outTradeNo.includes(kw)) ||
        r.customerName.includes(kw) ||
        r.customerPhone.includes(kw)
      )
    )
      return false
    if (f.orderNo && !r.orderNo.includes(f.orderNo)) return false
    if (f.outTradeNo && !(r.outTradeNo && r.outTradeNo.includes(f.outTradeNo))) return false
    if (f.customerName && !r.customerName.includes(f.customerName)) return false
    if (f.customerPhone && !r.customerPhone.includes(f.customerPhone)) return false
    if (f.status && r.status !== f.status) return false
    if (f.channel && r.channel !== f.channel) return false
    if (f.payType && r.payType !== f.payType) return false
    if (f.riskLevel && r.riskLevel !== f.riskLevel) return false
    if (f.dateRange && f.dateRange[0] && dayjs(r.createdAt).isBefore(f.dateRange[0], 'day')) return false
    if (f.dateRange && f.dateRange[1] && dayjs(r.createdAt).isAfter(f.dateRange[1], 'day')) return false
    return true
  })
}

// 是否存在生效中的筛选条件（用于空态区分“无数据”与“筛选过窄”）
export function hasActiveFilters(f = {}) {
  return Boolean(
    (f.keyword && f.keyword.trim()) ||
      f.orderNo ||
      f.outTradeNo ||
      f.customerName ||
      f.customerPhone ||
      f.status ||
      f.channel ||
      f.payType ||
      f.riskLevel ||
      (f.dateRange && (f.dateRange[0] || f.dateRange[1]))
  )
}
