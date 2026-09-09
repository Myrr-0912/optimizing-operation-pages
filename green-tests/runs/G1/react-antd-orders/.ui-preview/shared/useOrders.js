import { useCallback, useEffect, useRef, useState } from 'react'
import dayjs from 'dayjs'
import { fetchOrders } from '../mock/orders.js'

/** 三套方案共用的数据加载 Hook：支持演示场景（正常/加载/空/错误）与重试 */
export function useOrders(scenario) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const seq = useRef(0)

  const reload = useCallback(() => {
    const ticket = ++seq.current
    setLoading(true)
    setError(null)
    fetchOrders({ scenario })
      .then((data) => {
        if (ticket !== seq.current) return
        setRows(data)
        setLoading(false)
      })
      .catch((e) => {
        if (ticket !== seq.current) return
        setRows([])
        setError(e.message || '加载失败')
        setLoading(false)
      })
  }, [scenario])

  useEffect(() => {
    reload()
  }, [reload])

  return { rows, setRows, loading, error, reload }
}

/** 三套方案共用的前端过滤逻辑（keyword 聚合匹配 订单号/外部交易号/客户名/手机号） */
export function filterOrders(rows, f) {
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
    if (f.status && r.status !== f.status) return false
    if (f.channel && r.channel !== f.channel) return false
    if (f.payType && r.payType !== f.payType) return false
    if (f.riskLevel && r.riskLevel !== f.riskLevel) return false
    if (f.dateRange && f.dateRange[0] && dayjs(r.createdAt).isBefore(f.dateRange[0], 'day')) return false
    if (f.dateRange && f.dateRange[1] && dayjs(r.createdAt).isAfter(f.dateRange[1], 'day')) return false
    return true
  })
}

export const EMPTY_FILTERS = {
  keyword: '',
  status: undefined,
  channel: undefined,
  payType: undefined,
  riskLevel: undefined,
  dateRange: null
}

/** 已生效筛选条件 → 可移除标签列表 */
export function activeFilterTags(f, dicts) {
  const tags = []
  if (f.keyword && f.keyword.trim()) tags.push({ key: 'keyword', label: `关键词：${f.keyword.trim()}` })
  if (f.status) tags.push({ key: 'status', label: `状态：${dicts.STATUS_TEXT[f.status]}` })
  if (f.channel) tags.push({ key: 'channel', label: `渠道：${dicts.CHANNEL_TEXT[f.channel]}` })
  if (f.payType) tags.push({ key: 'payType', label: `支付：${dicts.PAY_TEXT[f.payType]}` })
  if (f.riskLevel) tags.push({ key: 'riskLevel', label: `风险：${dicts.RISK_TEXT[f.riskLevel]}` })
  if (f.dateRange && (f.dateRange[0] || f.dateRange[1]))
    tags.push({
      key: 'dateRange',
      label: `创建时间：${f.dateRange[0] ? f.dateRange[0].format('MM-DD') : '…'} ~ ${f.dateRange[1] ? f.dateRange[1].format('MM-DD') : '…'}`
    })
  return tags
}
