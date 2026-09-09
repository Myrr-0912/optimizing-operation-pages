import React, { useEffect, useState } from 'react'
import { Table, Button, Input, Select, DatePicker, Row, Col, message } from 'antd'
import dayjs from 'dayjs'
import { fetchOrders, STATUS_TEXT } from '../mock/orders'

const { RangePicker } = DatePicker

export default function OrdersPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState([])
  const [orderNo, setOrderNo] = useState('')
  const [outTradeNo, setOutTradeNo] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [status, setStatus] = useState(undefined)
  const [channel, setChannel] = useState(undefined)
  const [payType, setPayType] = useState(undefined)
  const [riskLevel, setRiskLevel] = useState(undefined)
  const [dateRange, setDateRange] = useState(null)

  useEffect(() => {
    load()
  }, [])

  function load() {
    setLoading(true)
    fetchOrders().then((rows) => {
      setData(rows)
      setLoading(false)
    })
  }

  function doFilter(rows) {
    return rows.filter((r) => {
      if (orderNo && !r.orderNo.includes(orderNo)) return false
      if (outTradeNo && !r.outTradeNo.includes(outTradeNo)) return false
      if (customerName && !r.customerName.includes(customerName)) return false
      if (customerPhone && !r.customerPhone.includes(customerPhone)) return false
      if (status && r.status !== status) return false
      if (channel && r.channel !== channel) return false
      if (payType && r.payType !== payType) return false
      if (riskLevel && r.riskLevel !== riskLevel) return false
      if (dateRange && dateRange[0] && dayjs(r.createdAt).isBefore(dateRange[0], 'day')) return false
      if (dateRange && dateRange[1] && dayjs(r.createdAt).isAfter(dateRange[1], 'day')) return false
      return true
    })
  }

  function handleDelete(row) {
    if (window.confirm('删除?')) {
      setData(data.filter((d) => d.id !== row.id))
      message.info('已删除')
    }
  }

  function handleBatchClose() {
    setData(data.map((d) => (selectedKeys.includes(d.id) ? { ...d, status: 'CLOSED' } : d)))
    setSelectedKeys([])
    window.alert('批量关闭完成')
  }

  function handleExport() {
    window.alert('导出任务已提交，请稍后到下载中心查看')
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 300 },
    { title: '订单号', dataIndex: 'orderNo', width: 160 },
    { title: '外部交易号', dataIndex: 'outTradeNo', width: 160 },
    { title: '客户', dataIndex: 'customerName', width: 90 },
    { title: '手机号', dataIndex: 'customerPhone', width: 130 },
    { title: 'SKU数', dataIndex: 'skuCount', width: 80 },
    { title: '金额', dataIndex: 'amount', width: 100, render: (v) => v.toFixed(2) },
    { title: '优惠', dataIndex: 'discount', width: 80 },
    { title: '运费', dataIndex: 'freight', width: 80 },
    { title: '状态', dataIndex: 'status', width: 90, render: (v) => STATUS_TEXT[v] },
    { title: '渠道', dataIndex: 'channel', width: 80 },
    { title: '支付方式', dataIndex: 'payType', width: 100 },
    { title: '同步标记', dataIndex: 'syncFlag', width: 90 },
    { title: '风险等级', dataIndex: 'riskLevel', width: 90 },
    { title: '备注', dataIndex: 'remark', width: 200 },
    { title: '创建时间', dataIndex: 'createdAt', width: 170, render: (v) => v.replace('T', ' ').slice(0, 19) },
    { title: '更新时间', dataIndex: 'updatedAt', width: 170, render: (v) => v.replace('T', ' ').slice(0, 19) },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 300,
      render: (_, row) => (
        <span>
          <Button size="small" type="link" onClick={() => window.alert(JSON.stringify(row, null, 2))}>
            详情
          </Button>
          <Button size="small" type="link" onClick={() => message.info('已催发货')}>
            催发货
          </Button>
          <Button size="small" type="link" onClick={() => message.info('已复制')}>
            复制
          </Button>
          <Button size="small" danger type="link" onClick={() => handleDelete(row)}>
            删除
          </Button>
          <Button size="small" type="link" onClick={() => message.info('已加入黑名单')}>
            拉黑
          </Button>
        </span>
      )
    }
  ]

  const filtered = doFilter(data)

  return (
    <div style={{ padding: 12 }}>
      <h2 style={{ margin: '4px 0 12px 0' }}>订单管理</h2>
      <div style={{ background: '#fafafa', border: '1px solid #eee', padding: 12, marginBottom: 8 }}>
        <Row gutter={8}>
          <Col span={5}>
            <Input placeholder="订单号" value={orderNo} onChange={(e) => setOrderNo(e.target.value)} />
          </Col>
          <Col span={5}>
            <Input placeholder="外部交易号" value={outTradeNo} onChange={(e) => setOutTradeNo(e.target.value)} />
          </Col>
          <Col span={4}>
            <Input placeholder="客户姓名" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          </Col>
          <Col span={5}>
            <Input placeholder="手机号" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
          </Col>
          <Col span={5}>
            <Select
              placeholder="状态"
              style={{ width: '100%' }}
              allowClear
              value={status}
              onChange={setStatus}
              options={Object.keys(STATUS_TEXT).map((k) => ({ value: k, label: STATUS_TEXT[k] }))}
            />
          </Col>
        </Row>
        <Row gutter={8} style={{ marginTop: 8 }}>
          <Col span={5}>
            <Select
              placeholder="渠道"
              style={{ width: '100%' }}
              allowClear
              value={channel}
              onChange={setChannel}
              options={['APP', 'H5', 'WXMP', 'PC'].map((v) => ({ value: v, label: v }))}
            />
          </Col>
          <Col span={5}>
            <Select
              placeholder="支付方式"
              style={{ width: '100%' }}
              allowClear
              value={payType}
              onChange={setPayType}
              options={['ALIPAY', 'WECHAT', 'BALANCE', 'UNIONPAY'].map((v) => ({ value: v, label: v }))}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="风险等级"
              style={{ width: '100%' }}
              allowClear
              value={riskLevel}
              onChange={setRiskLevel}
              options={['HIGH', 'MID', 'LOW'].map((v) => ({ value: v, label: v }))}
            />
          </Col>
          <Col span={10}>
            <RangePicker style={{ width: '100%' }} value={dateRange} onChange={setDateRange} />
          </Col>
        </Row>
      </div>
      <div style={{ marginBottom: 8 }}>
        <Button type="primary" onClick={load} style={{ marginRight: 8 }}>
          查询
        </Button>
        <Button onClick={handleExport} style={{ marginRight: 8 }}>
          导出全部
        </Button>
        <Button danger onClick={handleBatchClose} style={{ marginRight: 8 }}>
          批量关闭
        </Button>
        <Button onClick={() => message.info('已刷新')} style={{ marginRight: 8 }}>
          同步ERP
        </Button>
        <span style={{ color: '#999' }}>共 {filtered.length} 条</span>
      </div>
      <Table
        rowKey="id"
        size="small"
        loading={loading}
        columns={columns}
        dataSource={filtered}
        scroll={{ x: 2400 }}
        rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys }}
        pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
      />
    </div>
  )
}
