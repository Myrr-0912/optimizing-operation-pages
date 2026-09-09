import React from 'react'
import { Drawer, Descriptions, Tag, Typography } from 'antd'
import {
  STATUS_TEXT,
  STATUS_COLOR,
  PAY_TEXT,
  CHANNEL_TEXT,
  RISK_TEXT,
  RISK_COLOR,
  fmtAmount,
  fmtDateTime
} from './dict.js'

// 替代原页面 window.alert(JSON.stringify(row)) 的详情抽屉。
// UUID、同步标记、完整手机号等元数据收在这里，不再占用表格列。
export default function OrderDetailDrawer({ order, open, onClose, width = 480 }) {
  return (
    <Drawer
      title={order ? `订单详情 · ${order.orderNo}` : '订单详情'}
      open={open}
      onClose={onClose}
      width={width}
      destroyOnClose
    >
      {order && (
        <>
          <Descriptions title="基本信息" column={1} size="small" style={{ marginBottom: 24 }}>
            <Descriptions.Item label="订单号">
              <Typography.Text copyable>{order.orderNo}</Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label="外部交易号">
              {order.outTradeNo ? <Typography.Text copyable>{order.outTradeNo}</Typography.Text> : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={STATUS_COLOR[order.status]}>{STATUS_TEXT[order.status]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="风险等级">
              <Tag color={RISK_COLOR[order.riskLevel]}>{RISK_TEXT[order.riskLevel]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="渠道">{CHANNEL_TEXT[order.channel] || order.channel}</Descriptions.Item>
            <Descriptions.Item label="支付方式">{PAY_TEXT[order.payType] || order.payType}</Descriptions.Item>
            <Descriptions.Item label="SKU 数">{order.skuCount}</Descriptions.Item>
            <Descriptions.Item label="备注">{order.remark || '—'}</Descriptions.Item>
          </Descriptions>
          <Descriptions title="客户信息" column={1} size="small" style={{ marginBottom: 24 }}>
            <Descriptions.Item label="姓名">{order.customerName}</Descriptions.Item>
            <Descriptions.Item label="手机号">
              <Typography.Text copyable>{order.customerPhone}</Typography.Text>
            </Descriptions.Item>
          </Descriptions>
          <Descriptions title="金额" column={1} size="small" style={{ marginBottom: 24 }}>
            <Descriptions.Item label="订单金额">{fmtAmount(order.amount)}</Descriptions.Item>
            <Descriptions.Item label="优惠">{order.discount ? '-' + fmtAmount(order.discount) : '—'}</Descriptions.Item>
            <Descriptions.Item label="运费">{order.freight ? fmtAmount(order.freight) : '包邮'}</Descriptions.Item>
          </Descriptions>
          <Descriptions title="系统信息" column={1} size="small">
            <Descriptions.Item label="ID">
              <Typography.Text copyable style={{ fontSize: 12 }}>
                {order.id}
              </Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label="ERP 同步">{order.syncFlag === 1 ? '已同步' : '未同步'}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{fmtDateTime(order.createdAt)}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{fmtDateTime(order.updatedAt)}</Descriptions.Item>
          </Descriptions>
        </>
      )}
    </Drawer>
  )
}
