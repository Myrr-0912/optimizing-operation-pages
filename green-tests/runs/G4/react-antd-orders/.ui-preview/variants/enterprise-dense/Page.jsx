import React, { useMemo, useState } from 'react'
import {
  App as AntApp,
  Alert,
  Button,
  Col,
  ConfigProvider,
  DatePicker,
  Dropdown,
  Empty,
  Input,
  Row,
  Select,
  Skeleton,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography
} from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { useOrders } from '../../shared/useOrders.js'
import { filterOrders, hasActiveFilters } from '../../shared/filters.js'
import ScenarioBar from '../../shared/ScenarioBar.jsx'
import OrderDetailDrawer from '../../shared/OrderDetailDrawer.jsx'
import {
  STATUS_TEXT,
  STATUS_COLOR,
  PAY_TEXT,
  CHANNEL_TEXT,
  RISK_TEXT,
  RISK_COLOR,
  STATUS_OPTIONS,
  CHANNEL_OPTIONS,
  PAY_OPTIONS,
  RISK_OPTIONS,
  fmtAmount,
  fmtDateTime,
  maskPhone
} from '../../shared/dict.js'
import { urgeShip, copyOrderNo, confirmDelete, confirmBlacklist, confirmBatchClose, exportAll, syncErp } from '../../shared/actions.js'

const { RangePicker } = DatePicker

const EMPTY_FILTERS = {
  keyword: '',
  orderNo: '',
  outTradeNo: '',
  customerName: '',
  customerPhone: '',
  status: undefined,
  channel: undefined,
  payType: undefined,
  riskLevel: undefined,
  dateRange: null
}

function ActiveFilterTags({ filters, onRemove, onClear }) {
  const items = []
  const push = (key, label) => items.push({ key, label })
  if (filters.keyword.trim()) push('keyword', `关键字：${filters.keyword.trim()}`)
  if (filters.orderNo) push('orderNo', `订单号：${filters.orderNo}`)
  if (filters.outTradeNo) push('outTradeNo', `外部交易号：${filters.outTradeNo}`)
  if (filters.customerName) push('customerName', `客户：${filters.customerName}`)
  if (filters.customerPhone) push('customerPhone', `手机号：${filters.customerPhone}`)
  if (filters.status) push('status', `状态：${STATUS_TEXT[filters.status]}`)
  if (filters.channel) push('channel', `渠道：${CHANNEL_TEXT[filters.channel]}`)
  if (filters.payType) push('payType', `支付：${PAY_TEXT[filters.payType]}`)
  if (filters.riskLevel) push('riskLevel', `风险：${RISK_TEXT[filters.riskLevel]}`)
  if (filters.dateRange && (filters.dateRange[0] || filters.dateRange[1]))
    push(
      'dateRange',
      `创建时间：${filters.dateRange[0] ? filters.dateRange[0].format('MM-DD') : '…'} ~ ${
        filters.dateRange[1] ? filters.dateRange[1].format('MM-DD') : '…'
      }`
    )
  if (!items.length) return null
  return (
    <div style={{ padding: '6px 12px 0 12px' }}>
      {items.map((it) => (
        <Tag key={it.key} closable onClose={() => onRemove(it.key)} style={{ marginBottom: 4 }}>
          {it.label}
        </Tag>
      ))}
      <Typography.Link style={{ fontSize: 12 }} onClick={onClear}>
        清空全部
      </Typography.Link>
    </div>
  )
}

function DensePageInner() {
  const { message, modal } = AntApp.useApp()
  const { data, setData, loading, error, scenario, setScenario, reload } = useOrders()
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [moreOpen, setMoreOpen] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState([])
  const [detail, setDetail] = useState(null)

  const filtered = useMemo(() => filterOrders(data, filters), [data, filters])
  const patch = (p) => setFilters((f) => ({ ...f, ...p }))
  const removeFilter = (key) =>
    patch({ [key]: key === 'dateRange' ? null : typeof EMPTY_FILTERS[key] === 'string' ? '' : undefined })
  const clearFilters = () => setFilters(EMPTY_FILTERS)

  const columns = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      width: 140,
      fixed: 'left',
      render: (v, row) => (
        <Typography.Link onClick={() => setDetail(row)} style={{ fontFamily: 'Consolas, Menlo, monospace' }}>
          {v}
        </Typography.Link>
      )
    },
    {
      title: '客户',
      dataIndex: 'customerName',
      width: 130,
      render: (v, row) => (
        <div style={{ lineHeight: 1.3 }}>
          <div>{v}</div>
          <div style={{ color: '#999', fontSize: 12 }}>{maskPhone(row.customerPhone)}</div>
        </div>
      )
    },
    {
      title: '金额',
      dataIndex: 'amount',
      width: 110,
      align: 'right',
      render: (v, row) => (
        <Tooltip
          title={`优惠 ${row.discount ? '-' + fmtAmount(row.discount) : '无'} · ${row.freight ? '运费 ' + fmtAmount(row.freight) : '包邮'}`}
        >
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtAmount(v)}</span>
        </Tooltip>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (v) => <Tag color={STATUS_COLOR[v]}>{STATUS_TEXT[v]}</Tag>
    },
    {
      title: '风险',
      dataIndex: 'riskLevel',
      width: 90,
      render: (v) =>
        v === 'LOW' ? <span style={{ color: '#999' }}>低</span> : <Tag color={RISK_COLOR[v]}>{RISK_TEXT[v]}</Tag>
    },
    {
      title: '渠道 / 支付',
      dataIndex: 'channel',
      width: 150,
      render: (v, row) => `${CHANNEL_TEXT[v] || v} · ${PAY_TEXT[row.payType] || row.payType}`
    },
    { title: 'SKU', dataIndex: 'skuCount', width: 60, align: 'right' },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 130,
      render: (v, row) => (
        <Tooltip title={`更新于 ${fmtDateTime(row.updatedAt)}`}>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtDateTime(v)}</span>
        </Tooltip>
      )
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 168,
      render: (_, row) => (
        <Space size={4}>
          <Button size="small" type="link" onClick={() => setDetail(row)}>
            详情
          </Button>
          <Button size="small" type="link" onClick={() => urgeShip(message, row)}>
            催发货
          </Button>
          <Dropdown
            menu={{
              items: [
                { key: 'copy', label: '复制订单号' },
                { type: 'divider' },
                { key: 'blacklist', label: '加入黑名单', danger: true },
                { key: 'delete', label: '删除订单', danger: true }
              ],
              onClick: ({ key }) => {
                if (key === 'copy') copyOrderNo(message, row)
                if (key === 'blacklist') confirmBlacklist(modal, message, row)
                if (key === 'delete')
                  confirmDelete(modal, message, row, () => setData((d) => d.filter((x) => x.id !== row.id)))
              }
            }}
          >
            <Button size="small" type="link">
              更多 ▾
            </Button>
          </Dropdown>
        </Space>
      )
    }
  ]

  const filtering = hasActiveFilters(filters)

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      {/* 页头：标题 + 全局低频操作 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 12px',
          borderBottom: '1px solid #e8e8e8'
        }}
      >
        <span style={{ fontSize: 16, fontWeight: 600 }}>订单管理</span>
        <Space>
          <Button onClick={() => exportAll(message, filtered.length)}>导出全部</Button>
          <Button onClick={() => syncErp(message)}>同步 ERP</Button>
        </Space>
      </div>

      {/* 筛选条：高频常驻 + 更多筛选折叠 */}
      <div style={{ background: '#fafafa', borderBottom: '1px solid #e8e8e8', padding: '8px 12px' }}>
        <Space wrap>
          <Input
            allowClear
            placeholder="订单号 / 外部交易号 / 客户 / 手机号"
            style={{ width: 260 }}
            value={filters.keyword}
            onChange={(e) => patch({ keyword: e.target.value })}
          />
          <Select
            allowClear
            placeholder="状态"
            style={{ width: 110 }}
            value={filters.status}
            onChange={(v) => patch({ status: v })}
            options={STATUS_OPTIONS}
          />
          <RangePicker value={filters.dateRange} onChange={(v) => patch({ dateRange: v })} />
          <Button type="link" onClick={() => setMoreOpen((o) => !o)}>
            更多筛选 {moreOpen ? '▲' : '▼'}
          </Button>
          <Button onClick={clearFilters} disabled={!filtering}>
            重置
          </Button>
          <Button onClick={reload}>刷新</Button>
        </Space>
        {moreOpen && (
          <Row gutter={[8, 8]} style={{ marginTop: 8, maxWidth: 980 }}>
            <Col span={6}>
              <Input
                allowClear
                placeholder="订单号（精确筛）"
                value={filters.orderNo}
                onChange={(e) => patch({ orderNo: e.target.value })}
              />
            </Col>
            <Col span={6}>
              <Input
                allowClear
                placeholder="外部交易号"
                value={filters.outTradeNo}
                onChange={(e) => patch({ outTradeNo: e.target.value })}
              />
            </Col>
            <Col span={6}>
              <Input
                allowClear
                placeholder="客户姓名"
                value={filters.customerName}
                onChange={(e) => patch({ customerName: e.target.value })}
              />
            </Col>
            <Col span={6}>
              <Input
                allowClear
                placeholder="手机号"
                value={filters.customerPhone}
                onChange={(e) => patch({ customerPhone: e.target.value })}
              />
            </Col>
            <Col span={6}>
              <Select
                allowClear
                placeholder="渠道"
                style={{ width: '100%' }}
                value={filters.channel}
                onChange={(v) => patch({ channel: v })}
                options={CHANNEL_OPTIONS}
              />
            </Col>
            <Col span={6}>
              <Select
                allowClear
                placeholder="支付方式"
                style={{ width: '100%' }}
                value={filters.payType}
                onChange={(v) => patch({ payType: v })}
                options={PAY_OPTIONS}
              />
            </Col>
            <Col span={6}>
              <Select
                allowClear
                placeholder="风险等级"
                style={{ width: '100%' }}
                value={filters.riskLevel}
                onChange={(v) => patch({ riskLevel: v })}
                options={RISK_OPTIONS}
              />
            </Col>
          </Row>
        )}
      </div>

      <ActiveFilterTags filters={filters} onRemove={removeFilter} onClear={clearFilters} />

      {/* 工具栏：批量操作 + 计数 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px'
        }}
      >
        <Space>
          <Tooltip title={selectedKeys.length ? '' : '先在表格中勾选订单'}>
            <Button
              danger
              disabled={!selectedKeys.length}
              onClick={() =>
                confirmBatchClose(modal, message, selectedKeys.length, () => {
                  setData((d) => (d.map((x) => (selectedKeys.includes(x.id) ? { ...x, status: 'CLOSED' } : x))))
                  setSelectedKeys([])
                })
              }
            >
              批量关闭{selectedKeys.length ? `（${selectedKeys.length}）` : ''}
            </Button>
          </Tooltip>
          {selectedKeys.length > 0 && (
            <Button type="link" onClick={() => setSelectedKeys([])}>
              取消选择
            </Button>
          )}
        </Space>
        <span style={{ color: '#999', fontSize: 12 }}>
          {filtering ? `筛选出 ${filtered.length} / ${data.length} 条` : `共 ${data.length} 条`}
        </span>
      </div>

      {/* 数据区：正常 / 加载 / 空 / 错误 */}
      <div style={{ padding: '0 12px 48px 12px' }}>
        {error ? (
          <Alert
            type="error"
            showIcon
            message="订单列表加载失败"
            description={error}
            action={
              <Button size="small" danger onClick={reload}>
                重试
              </Button>
            }
          />
        ) : loading ? (
          <div style={{ padding: '8px 0' }}>
            <Skeleton active title={false} paragraph={{ rows: 10, width: '100%' }} />
          </div>
        ) : filtered.length === 0 ? (
          <Empty
            style={{ padding: '48px 0' }}
            description={filtering ? '没有匹配当前筛选条件的订单' : '暂无订单数据'}
          >
            {filtering && <Button onClick={clearFilters}>清空筛选</Button>}
          </Empty>
        ) : (
          <Table
            rowKey="id"
            size="small"
            columns={columns}
            dataSource={filtered}
            scroll={{ x: 1080 }}
            rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys }}
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showTotal: (t) => `共 ${t} 条`
            }}
          />
        )}
      </div>

      <OrderDetailDrawer order={detail} open={!!detail} onClose={() => setDetail(null)} />
      <ScenarioBar scenario={scenario} onChange={setScenario} />
    </div>
  )
}

// 风格包 enterprise-dense：单平面布局、size=small、近直角、13px 正文、显式边框分区
export default function EnterpriseDensePage() {
  return (
    <ConfigProvider
      locale={zhCN}
      componentSize="small"
      theme={{ token: { borderRadius: 4, fontSize: 13, colorBgLayout: '#f5f5f5' } }}
    >
      <AntApp>
        <DensePageInner />
      </AntApp>
    </ConfigProvider>
  )
}
