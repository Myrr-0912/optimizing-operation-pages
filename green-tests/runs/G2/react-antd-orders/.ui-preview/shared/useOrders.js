import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchOrders } from '../mock/orders'

/**
 * 三套方案共用的数据 hook。
 * scenario: normal | slow | empty | error —— 由 ScenarioBar 切换，用于演示五种页面状态。
 */
export function useOrders() {
  const [scenario, setScenario] = useState('normal')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const seq = useRef(0)

  const load = useCallback(
    (sc) => {
      const target = sc || scenario
      const my = ++seq.current
      setLoading(true)
      setError(null)
      fetchOrders(target)
        .then((data) => {
          if (seq.current !== my) return
          setRows(data)
          setLoading(false)
        })
        .catch((e) => {
          if (seq.current !== my) return
          setRows([])
          setError(e.message || '加载失败')
          setLoading(false)
        })
    },
    [scenario]
  )

  useEffect(() => {
    load(scenario)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario])

  return { rows, setRows, loading, error, scenario, setScenario, reload: () => load() }
}

/** 通用筛选：字段为空则跳过。keyword 聚合匹配 订单号/外部交易号/客户姓名/手机号。 */
export function applyFilters(rows, f, dayjs) {
  return rows.filter((r) => {
    if (f.keyword) {
      const k = f.keyword.trim()
      if (
        k &&
        !r.orderNo.includes(k) &&
        !r.outTradeNo.includes(k) &&
        !r.customerName.includes(k) &&
        !r.customerPhone.includes(k)
      )
        return false
    }
    if (f.orderNo && !r.orderNo.includes(f.orderNo)) return false
    if (f.outTradeNo && !r.outTradeNo.includes(f.outTradeNo)) return false
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
