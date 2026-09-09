import React, { useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Drawer,
  Dropdown,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  message
} from 'antd'
import {
  DownOutlined,
  ExportOutlined,
  ReloadOutlined,
  SearchOutlined,
  SyncOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { fetchOrders, STATUS_TEXT } from '../mock/orders'

const { RangePicker } = DatePicker
const { Text } = Typography

const STATUS_COLOR = {
  WAIT_PAY: 'orange',
  PAID: 'blue',
  SHIPPED: 'geekblue',
  FINISHED: 'green',
  CLOSED: 'default',
  REFUNDING: 'red'
}

const CHANNEL_TEXT = { APP: 'APP', H5: 'H5', WXMP: '微信小程序', PC: 'PC' }
const PAY_TEXT = { ALIPAY: '支付宝', WECHAT: '微信支付', BALANCE: '余额', UNIONPAY: '银联' }
const RISK_META = {
  HIGH: { text: '高', color: 'red' },
  MID: { text: '中', color: 'orange' },
  LOW: { text: '低', color: null }
}

const fmtMoney = (v) =>
  '¥' + Number(v).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtTime = (v) => dayjs(v).format('YYYY-MM-DD HH:mm')

export default function OrdersPage() {
  const [form] = Form.useForm()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState([])
  const [filters, setFilters] = useState({})
  const [statusTab, setStatusTab] = useState('ALL')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [detail, setDetail] = useState(null)

  useEffect(() => {
    load()
  }, [])

  function load() {
    setLoading(true)
    fetchOrders().then((rows) => {
      setData(rows)
      setSelectedKeys([])
      setLoading(false)
    })
  }

  // —— 查询 / 筛选 ——

  function handleSearch(values) {
    setFilters(values)
    setPage(1)
    setSelectedKeys([])
  }

  function handleReset() {
    form.resetFields()
    setFilters({})
    setPage(1)
    setSelectedKeys([])
  }

  const baseFiltered = useMemo(() => {
    const { keyword, customer, channel, payType, riskLevel, dateRange } = filters
    const kw = (keyword || '').trim()
    const cs = (customer || '').trim()
    return data.filter((r) => {
      if (kw && !r.orderNo.includes(kw) && !r.outTradeNo.includes(kw)) return false
      if (cs && !r.customerName.includes(cs) && !r.customerPhone.includes(cs)) return false
      if (channel && r.channel !== channel) return false
      if (payType && r.payType !== payType) return false
      if (riskLevel && r.riskLevel !== riskLevel) return false
      if (dateRange && dateRange[0] && dayjs(r.createdAt).isBefore(dateRange[0], 'day')) return false
      if (dateRange && dateRange[1] && dayjs(r.createdAt).isAfter(dateRange[1], 'day')) return false
      return true
    })
  }, [data, filters])

  const statusCounts = useMemo(() => {
    const counts = { ALL: baseFiltered.length }
    for (const r of baseFiltered) counts[r.status] = (counts[r.status] || 0) + 1
    return counts
  }, [baseFiltered])

  const filtered = useMemo(
    () => (statusTab === 'ALL' ? baseFiltered : baseFiltered.filter((r) => r.status === statusTab)),
    [baseFiltered, statusTab]
  )

  // —— 行内 / 批量操作 ——

  function handleDelete(row) {
    Modal.confirm({
      title: '确认删除该订单？',
      content: `订单 ${row.orderNo} 删除后不可恢复。`,
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => {
        setData((prev) => prev.filter((d) => d.id !== row.id))
        setSelectedKeys((prev) => prev.filter((k) => k !== row.id))
        message.success(`订单 ${row.orderNo} 已删除`)
      }
    })
  }

  function handleBlock(row) {
    Modal.confirm({
      title: '拉黑客户',
      content: `确认将客户 ${row.customerName}（${row.customerPhone}）加入黑名单？`,
      okText: '拉黑',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => message.success(`已将 ${row.customerName} 加入黑名单`)
    })
  }

  function handleCopy(row) {
    const doneTip = () => message.success(`订单号 ${row.orderNo} 已复制`)
    if (navigator.clipboard) {
      navigator.clipboard.writeText(row.orderNo).then(doneTip, doneTip)
    } else {
      doneTip()
    }
  }

  function handleUrge(row) {
    message.success(`已向仓库催促订单 ${row.orderNo} 发货`)
  }

  function handleBatchClose() {
    const closable = data.filter((d) => selectedKeys.includes(d.id) && d.status !== 'CLOSED')
    if (!closable.length) {
      message.warning('所选订单均已是「已关闭」状态')
      return
    }
    const skipped = selectedKeys.length - closable.length
    Modal.confirm({
      title: '批量关闭订单',
      content: `将关闭 ${closable.length} 笔订单${skipped > 0 ? `（自动跳过 ${skipped} 笔已关闭订单）` : ''}，是否继续？`,
      okText: '关闭订单',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => {
        const ids = new Set(closable.map((d) => d.id))
        setData((prev) => prev.map((d) => (ids.has(d.id) ? { ...d, status: 'CLOSED' } : d)))
        setSelectedKeys([])
        message.success(`已关闭 ${closable.length} 笔订单`)
      }
    })
  }

  function handleExport() {
    const n = selectedKeys.length || filtered.length
    message.success(`导出任务已提交（${n} 条），完成后可在下载中心查看`)
  }

  function handleSync() {
    setSyncing(true)
    setTimeout(() => {
      setSyncing(false)
      message.success('ERP 同步任务已触发')
    }, 800)
  }

  // —— 表格列 ——

  const columns = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      width: 220,
      render: (v, row) => (
        <>
          <Text copyable={{ text: v, tooltips: ['复制订单号', '已复制'] }}>{v}</Text>
          <div style={{ color: '#999', fontSize: 12 }}>外部单号 {row.outTradeNo || '—'}</div>
        </>
      )
    },
    {
      title: '客户',
      dataIndex: 'customerName',
      width: 130,
      render: (v, row) => (
        <>
          <div>{v}</div>
          <div style={{ color: '#999', fontSize: 12 }}>{row.customerPhone}</div>
        </>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (v) => <Tag color={STATUS_COLOR[v]}>{STATUS_TEXT[v]}</Tag>
    },
    {
      title: '金额',
      dataIndex: 'amount',
      width: 130,
      align: 'right',
      sorter: (a, b) => a.amount - b.amount,
      render: (v, row) => (
        <>
          <div style={{ fontWeight: 500 }}>{fmtMoney(v)}</div>
          {row.discount > 0 && (
            <div style={{ color: '#fa8c16', fontSize: 12 }}>优惠 -{fmtMoney(row.discount)}</div>
          )}
        </>
      )
    },
    { title: 'SKU 数', dataIndex: 'skuCount', width: 70, align: 'center' },
    { title: '渠道', dataIndex: 'channel', width: 100, render: (v) => CHANNEL_TEXT[v] || v },
    { title: '支付方式', dataIndex: 'payType', width: 100, render: (v) => PAY_TEXT[v] || v },
    {
      title: '风险',
      dataIndex: 'riskLevel',
      width: 70,
      align: 'center',
      render: (v) => {
        const meta = RISK_META[v] || { text: v }
        return meta.color ? (
          <Tag color={meta.color}>{meta.text}</Tag>
        ) : (
          <span style={{ color: '#999' }}>{meta.text}</span>
        )
      }
    },
    {
      title: 'ERP 同步',
      dataIndex: 'syncFlag',
      width: 95,
      render: (v) => <Badge status={v ? 'success' : 'warning'} text={v ? '已同步' : '未同步'} />
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 160,
      ellipsis: { showTitle: false },
      render: (v) =>
        v ? (
          <Tooltip placement="topLeft" title={v}>
            {v}
          </Tooltip>
        ) : (
          <span style={{ color: '#ccc' }}>—</span>
        )
    },
    {
      title: '下单时间',
      dataIndex: 'createdAt',
      width: 150,
      sorter: (a, b) => a.createdAt.localeCompare(b.createdAt),
      render: fmtTime
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 185,
      render: (_, row) => (
        <Space size={0}>
          <Button size="small" type="link" onClick={() => setDetail(row)}>
            详情
          </Button>
          <Tooltip title={row.status !== 'PAID' ? '仅「已支付」订单可催发货' : ''}>
            <Button
              size="small"
              type="link"
              disabled={row.status !== 'PAID'}
              onClick={() => handleUrge(row)}
            >
              催发货
            </Button>
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                { key: 'copy', label: '复制订单号' },
                { key: 'block', label: '拉黑客户' },
                { type: 'divider' },
                { key: 'delete', label: '删除订单', danger: true }
              ],
              onClick: ({ key }) => {
                if (key === 'copy') handleCopy(row)
                else if (key === 'block') handleBlock(row)
                else if (key === 'delete') handleDelete(row)
              }
            }}
          >
            <Button size="small" type="link">
              更多 <DownOutlined style={{ fontSize: 10 }} />
            </Button>
          </Dropdown>
        </Space>
      )
    }
  ]

  const tabItems = [
    { key: 'ALL', label: `全部 (${statusCounts.ALL || 0})` },
    ...Object.keys(STATUS_TEXT).map((k) => ({
      key: k,
      label: `${STATUS_TEXT[k]} (${statusCounts[k] || 0})`
    }))
  ]

  const detailItems = detail
    ? [
        {
          label: '订单号',
          children: <Text copyable>{detail.orderNo}</Text>
        },
        { label: '外部交易号', children: detail.outTradeNo || '—' },
        { label: '订单 ID', children: <Text copyable style={{ fontSize: 12 }}>{detail.id}</Text> },
        {
          label: '状态',
          children: <Tag color={STATUS_COLOR[detail.status]}>{STATUS_TEXT[detail.status]}</Tag>
        },
        { label: '客户姓名', children: detail.customerName },
        { label: '手机号', children: detail.customerPhone },
        { label: '渠道', children: CHANNEL_TEXT[detail.channel] || detail.channel },
        { label: '支付方式', children: PAY_TEXT[detail.payType] || detail.payType },
        { label: 'SKU 数', children: detail.skuCount },
        { label: '订单金额', children: fmtMoney(detail.amount) },
        { label: '优惠金额', children: detail.discount > 0 ? '-' + fmtMoney(detail.discount) : '—' },
        { label: '运费', children: detail.freight > 0 ? fmtMoney(detail.freight) : '免运费' },
        {
          label: '风险等级',
          children: (() => {
            const meta = RISK_META[detail.riskLevel] || { text: detail.riskLevel }
            return meta.color ? <Tag color={meta.color}>{meta.text}</Tag> : meta.text
          })()
        },
        {
          label: 'ERP 同步',
          children: (
            <Badge
              status={detail.syncFlag ? 'success' : 'warning'}
              text={detail.syncFlag ? '已同步' : '未同步'}
            />
          )
        },
        { label: '备注', children: detail.remark || '—' },
        { label: '创建时间', children: fmtTime(detail.createdAt) },
        { label: '更新时间', children: fmtTime(detail.updatedAt) }
      ]
    : []

  return (
    <div style={{ padding: 16, background: '#f0f2f5', minHeight: '100vh' }}>
      <Space direction="vertical" size={12} style={{ display: 'flex' }}>
        <Typography.Title level={4} style={{ margin: '4px 0 0' }}>
          订单管理
        </Typography.Title>

        <Card styles={{ body: { paddingBottom: 0 } }}>
          <Form form={form} onFinish={handleSearch}>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item name="keyword" label="订单号">
                  <Input placeholder="订单号 / 外部交易号" allowClear />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name="customer" label="客户">
                  <Input placeholder="姓名 / 手机号" allowClear />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="channel" label="渠道">
                  <Select
                    placeholder="全部"
                    allowClear
                    options={Object.keys(CHANNEL_TEXT).map((v) => ({
                      value: v,
                      label: CHANNEL_TEXT[v]
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="payType" label="支付">
                  <Select
                    placeholder="全部"
                    allowClear
                    options={Object.keys(PAY_TEXT).map((v) => ({ value: v, label: PAY_TEXT[v] }))}
                  />
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item name="riskLevel" label="风险">
                  <Select
                    placeholder="全部"
                    allowClear
                    options={[
                      { value: 'HIGH', label: '高' },
                      { value: 'MID', label: '中' },
                      { value: 'LOW', label: '低' }
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="dateRange" label="下单时间">
                  <RangePicker
                    style={{ width: '100%' }}
                    presets={[
                      { label: '今天', value: [dayjs(), dayjs()] },
                      { label: '近 7 天', value: [dayjs().add(-6, 'd'), dayjs()] },
                      { label: '近 30 天', value: [dayjs().add(-29, 'd'), dayjs()] }
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col flex="auto" style={{ textAlign: 'right' }}>
                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                      查询
                    </Button>
                    <Button onClick={handleReset}>重置</Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        <Card styles={{ body: { paddingTop: 4 } }}>
          <Tabs
            activeKey={statusTab}
            onChange={(k) => {
              setStatusTab(k)
              setPage(1)
              setSelectedKeys([])
            }}
            items={tabItems}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12
            }}
          >
            <Space>
              <Button danger disabled={!selectedKeys.length} onClick={handleBatchClose}>
                批量关闭
              </Button>
              {selectedKeys.length > 0 && (
                <span style={{ color: '#666' }}>
                  已选 {selectedKeys.length} 项
                  <Button type="link" size="small" onClick={() => setSelectedKeys([])}>
                    清除
                  </Button>
                </span>
              )}
            </Space>
            <Space>
              <Button icon={<SyncOutlined />} loading={syncing} onClick={handleSync}>
                同步 ERP
              </Button>
              <Button icon={<ExportOutlined />} onClick={handleExport}>
                {selectedKeys.length ? `导出所选 (${selectedKeys.length})` : '导出全部'}
              </Button>
              <Tooltip title="刷新数据">
                <Button icon={<ReloadOutlined />} onClick={load} />
              </Tooltip>
            </Space>
          </div>
          <Table
            rowKey="id"
            size="small"
            loading={loading}
            columns={columns}
            dataSource={filtered}
            scroll={{ x: 1430 }}
            rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys }}
            pagination={{
              current: page,
              pageSize,
              onChange: (p, ps) => {
                setPage(p)
                setPageSize(ps)
              },
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (t) => `共 ${t} 条`
            }}
          />
        </Card>
      </Space>

      <Drawer
        title="订单详情"
        width={480}
        open={!!detail}
        onClose={() => setDetail(null)}
        destroyOnClose
      >
        <Descriptions
          column={1}
          size="small"
          bordered
          styles={{ label: { width: 110 } }}
          items={detailItems}
        />
      </Drawer>
    </div>
  )
}
