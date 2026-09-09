import React from 'react'
import { Descriptions, Tag, Typography } from 'antd'
import { STATUS_TEXT, STATUS_COLOR, RISK_TEXT, RISK_COLOR, PAY_TEXT, CHANNEL_TEXT } from './constants.js'
import { fmtMoney, fmtDateTime } from './format.js'

/**
 * 订单完整字段展示（含被表格收起的技术元数据：UUID、同步标记、更新时间）。
 * 三套方案的详情抽屉/侧栏共用，column 由外部控制以适配布局。
 */
export function OrderDescriptions({ order, column = 2, size = 'small' }) {
  if (!order) return null
  return (
    <Descriptions column={column} size={size} bordered>
      <Descriptions.Item label="订单号" span={column}>
        <Typography.Text copyable>{order.orderNo}</Typography.Text>
      </Descriptions.Item>
      <Descriptions.Item label="外部交易号" span={column}>
        {order.outTradeNo ? <Typography.Text copyable>{order.outTradeNo}</Typography.Text> : '—'}
      </Descriptions.Item>
      <Descriptions.Item label="状态">
        <Tag color={STATUS_COLOR[order.status]}>{STATUS_TEXT[order.status]}</Tag>
      </Descriptions.Item>
      <Descriptions.Item label="风险等级">
        <Tag color={RISK_COLOR[order.riskLevel]}>{RISK_TEXT[order.riskLevel]}</Tag>
      </Descriptions.Item>
      <Descriptions.Item label="客户">{order.customerName}</Descriptions.Item>
      <Descriptions.Item label="手机号">{order.customerPhone}</Descriptions.Item>
      <Descriptions.Item label="实付金额">¥ {fmtMoney(order.amount)}</Descriptions.Item>
      <Descriptions.Item label="SKU 数">{order.skuCount}</Descriptions.Item>
      <Descriptions.Item label="优惠">{order.discount ? `- ¥ ${fmtMoney(order.discount)}` : '无'}</Descriptions.Item>
      <Descriptions.Item label="运费">{order.freight ? `¥ ${fmtMoney(order.freight)}` : '包邮'}</Descriptions.Item>
      <Descriptions.Item label="渠道">{CHANNEL_TEXT[order.channel]}</Descriptions.Item>
      <Descriptions.Item label="支付方式">{PAY_TEXT[order.payType]}</Descriptions.Item>
      <Descriptions.Item label="创建时间" span={column}>{fmtDateTime(order.createdAt)}</Descriptions.Item>
      <Descriptions.Item label="更新时间" span={column}>{fmtDateTime(order.updatedAt)}</Descriptions.Item>
      <Descriptions.Item label="备注" span={column}>{order.remark || '—'}</Descriptions.Item>
      <Descriptions.Item label="系统 ID" span={column}>
        <Typography.Text type="secondary" copyable style={{ fontSize: 12 }}>
          {order.id}
        </Typography.Text>
      </Descriptions.Item>
      <Descriptions.Item label="ERP 同步" span={column}>
        {order.syncFlag ? <Tag color="green">已同步</Tag> : <Tag color="orange">未同步</Tag>}
      </Descriptions.Item>
    </Descriptions>
  )
}
