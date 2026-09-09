import { useCallback, useEffect, useState } from 'react'
import { Drawer, Descriptions, Tag, Typography } from 'antd'
import dayjs from 'dayjs'
import { fetchOrders } from '../../mock/orders'

/* ---------- 字典 ---------- */

export const STATUS_META = {
  WAIT_PAY: { text: '待支付', color: 'orange' },
  PAID: { text: '已支付', color: 'blue' },
  SHIPPED: { text: '已发货', color: 'geekblue' },
  FINISHED: { text: '已完成', color: 'green' },
  CLOSED: { text: '已关闭', color: 'default' },
  REFUNDING: { text: '退款中', color: 'volcano' }
}

export const STATUS_KEYS = Object.keys(STATUS_META)

export const CHANNEL_TEXT = { APP: 'App', H5: 'H5', WXMP: '小程序', PC: '网页端' }
export const PAY_TEXT = { ALIPAY: '支付宝', WECHAT: '微信支付', BALANCE: '余额', UNIONPAY: '银联' }

export const RISK_META = {
  HIGH: { text: '高风险', short: '高', tag: 'red', dot: '#f5222d' },
  MID: { text: '中风险', short: '中', tag: 'orange', dot: '#fa8c16' },
  LOW: { text: '低风险', short: '低', tag: 'default', dot: '#b9c0cc' }
}

export const statusOptions = STATUS_KEYS.map((k) => ({ value: k, label: STATUS_META[k].text }))
export const channelOptions = Object.keys(CHANNEL_TEXT).map((k) => ({ value: k, label: CHANNEL_TEXT[k] }))
export const payOptions = Object.keys(PAY_TEXT).map((k) => ({ value: k, label: PAY_TEXT[k] }))
export const riskOptions = ['HIGH', 'MID', 'LOW'].map((k) => ({ value: k, label: RISK_META[k].text }))

/* ---------- 格式化 ---------- */

export function fmtMoney(v) {
  return '¥' + Number(v || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function fmtTime(v) {
  return v ? v.replace('T', ' ').slice(0, 16) : '—'
}

export function fmtTimeFull(v) {
  return v ? v.replace('T', ' ').slice(0, 19) : '—'
}

export function fmtTimeShort(v) {
  return v ? v.replace('T', ' ').slice(5, 16) : '—'
}

/* ---------- 数据 ---------- */

export function useOrders() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const reload = useCallback(() => {
    setLoading(true)
    fetchOrders().then((rows) => {
      setData(rows)
      setLoading(false)
    })
  }, [])
  useEffect(() => {
    reload()
  }, [reload])
  return { data, setData, loading, reload }
}

/**
 * 通用筛选。f 支持:
 * keyword(订单号/外部交易号/客户名/手机号 模糊)、orderNo、outTradeNo、
 * customerName、customerPhone、status、channel、payType、riskLevel、dateRange
 */
export function applyFilters(rows, f = {}) {
  const kw = (f.keyword || '').trim()
  return rows.filter((r) => {
    if (
      kw &&
      !r.orderNo.includes(kw) &&
      !r.outTradeNo.includes(kw) &&
      !r.customerName.includes(kw) &&
      !r.customerPhone.includes(kw)
    )
      return false
    if (f.orderNo && !r.orderNo.includes(f.orderNo.trim())) return false
    if (f.outTradeNo && !r.outTradeNo.includes(f.outTradeNo.trim())) return false
    if (f.customerName && !r.customerName.includes(f.customerName.trim())) return false
    if (f.customerPhone && !r.customerPhone.includes(f.customerPhone.trim())) return false
    if (f.status && r.status !== f.status) return false
    if (f.channel && r.channel !== f.channel) return false
    if (f.payType && r.payType !== f.payType) return false
    if (f.riskLevel && r.riskLevel !== f.riskLevel) return false
    if (f.dateRange && f.dateRange[0] && dayjs(r.createdAt).isBefore(f.dateRange[0], 'day')) return false
    if (f.dateRange && f.dateRange[1] && dayjs(r.createdAt).isAfter(f.dateRange[1], 'day')) return false
    return true
  })
}

export function copyText(text, messageApi) {
  const ok = () => messageApi && messageApi.success('已复制：' + text)
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(ok, ok)
  } else {
    ok()
  }
}

/* ---------- 订单详情抽屉（各方案共用，随所在主题变化） ---------- */

export function OrderDetailDrawer({ order, open, onClose, width = 560 }) {
  const payable = order ? order.amount - order.discount + order.freight : 0
  return (
    <Drawer title={order ? '订单详情' : ''} open={open} onClose={onClose} width={width} destroyOnClose>
      {order && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <Typography.Text strong style={{ fontSize: 16 }} copyable={{ text: order.orderNo }}>
              {order.orderNo}
            </Typography.Text>
            <Tag color={STATUS_META[order.status]?.color}>{STATUS_META[order.status]?.text || order.status}</Tag>
            {order.riskLevel !== 'LOW' && <Tag color={RISK_META[order.riskLevel].tag}>{RISK_META[order.riskLevel].text}</Tag>}
          </div>
          <Descriptions
            column={2}
            size="small"
            bordered
            items={[
              { key: 'customer', label: '客户', children: order.customerName },
              { key: 'phone', label: '手机号', children: order.customerPhone },
              { key: 'sku', label: 'SKU 数', children: order.skuCount },
              { key: 'channel', label: '下单渠道', children: CHANNEL_TEXT[order.channel] || order.channel },
              { key: 'amount', label: '订单金额', children: fmtMoney(order.amount) },
              { key: 'discount', label: '优惠', children: order.discount ? '-' + fmtMoney(order.discount) : '无' },
              { key: 'freight', label: '运费', children: order.freight ? fmtMoney(order.freight) : '包邮' },
              { key: 'payable', label: '应付合计', children: <b>{fmtMoney(payable)}</b> },
              { key: 'pay', label: '支付方式', children: PAY_TEXT[order.payType] || order.payType },
              {
                key: 'sync',
                label: 'ERP 同步',
                children: order.syncFlag ? <Tag color="success">已同步</Tag> : <Tag color="warning">未同步</Tag>
              },
              {
                key: 'out',
                label: '外部交易号',
                span: 2,
                children: order.outTradeNo ? (
                  <Typography.Text copyable style={{ fontFamily: 'Consolas, monospace' }}>
                    {order.outTradeNo}
                  </Typography.Text>
                ) : (
                  '—'
                )
              },
              {
                key: 'id',
                label: '系统 ID',
                span: 2,
                children: (
                  <Typography.Text type="secondary" copyable style={{ fontFamily: 'Consolas, monospace', fontSize: 12 }}>
                    {order.id}
                  </Typography.Text>
                )
              },
              { key: 'created', label: '创建时间', children: fmtTimeFull(order.createdAt) },
              { key: 'updated', label: '更新时间', children: fmtTimeFull(order.updatedAt) },
              { key: 'remark', label: '备注', span: 2, children: order.remark || '—' }
            ]}
          />
        </>
      )}
    </Drawer>
  )
}
