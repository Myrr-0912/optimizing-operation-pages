import React from 'react'
import { Descriptions, Drawer, Tag, Typography } from 'antd'
import { PAY_TEXT, RISK_COLOR, RISK_TEXT, STATUS_COLOR, STATUS_TEXT } from '../mock/orders'
import { fmtDateTime, fmtMoney } from './format'

/**
 * 订单详情抽屉：替代原页面的 window.alert(JSON.stringify(...))。
 * UUID / 外部交易号 / 同步标记 等技术元数据收纳在这里（可复制），不再占用表格默认列。
 */
export default function OrderDetailDrawer({ order, open, onClose, width = 480 }) {
  return (
    <Drawer title={order ? `订单 ${order.orderNo}` : '订单详情'} open={open} onClose={onClose} width={width}>
      {order && (
        <>
          <Descriptions column={1} size="small" bordered labelStyle={{ width: 110 }}>
            <Descriptions.Item label="状态">
              <Tag color={STATUS_COLOR[order.status]}>{STATUS_TEXT[order.status]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="客户">
              {order.customerName}（{order.customerPhone}）
            </Descriptions.Item>
            <Descriptions.Item label="金额">¥ {fmtMoney(order.amount)}</Descriptions.Item>
            <Descriptions.Item label="优惠 / 运费">
              -{fmtMoney(order.discount)} / +{fmtMoney(order.freight)}
            </Descriptions.Item>
            <Descriptions.Item label="SKU 数">{order.skuCount}</Descriptions.Item>
            <Descriptions.Item label="渠道 / 支付">
              {order.channel} · {PAY_TEXT[order.payType] || order.payType}
            </Descriptions.Item>
            <Descriptions.Item label="风险等级">
              <span style={{ color: RISK_COLOR[order.riskLevel] }}>{RISK_TEXT[order.riskLevel]}风险</span>
            </Descriptions.Item>
            <Descriptions.Item label="备注">{order.remark || '—'}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{fmtDateTime(order.createdAt)}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{fmtDateTime(order.updatedAt)}</Descriptions.Item>
          </Descriptions>
          <Descriptions
            column={1}
            size="small"
            bordered
            labelStyle={{ width: 110 }}
            style={{ marginTop: 16 }}
            title="技术信息"
          >
            <Descriptions.Item label="系统 ID">
              <Typography.Text copyable style={{ fontSize: 12 }}>
                {order.id}
              </Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label="外部交易号">
              {order.outTradeNo ? (
                <Typography.Text copyable style={{ fontSize: 12 }}>
                  {order.outTradeNo}
                </Typography.Text>
              ) : (
                '—'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="ERP 同步">{order.syncFlag ? '已同步' : '未同步'}</Descriptions.Item>
          </Descriptions>
        </>
      )}
    </Drawer>
  )
}
