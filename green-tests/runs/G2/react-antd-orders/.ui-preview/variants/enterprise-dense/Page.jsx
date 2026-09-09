import React, { useMemo, useState } from 'react'
import {
  Alert,
  App,
  Button,
  ConfigProvider,
  DatePicker,
  Dropdown,
  Empty,
  Input,
  Popover,
  Select,
  Skeleton,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography
} from 'antd'
import { DownOutlined, ReloadOutlined } from '@ant-design/icons'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import {
  CHANNELS,
  PAY_TEXT,
  PAY_TYPES,
  RISK_COLOR,
  RISK_LEVELS,
  RISK_TEXT,
  STATUS_COLOR,
  STATUS_TEXT
} from '../../mock/orders'
import { fmtDateTime, fmtMoney } from '../../shared/format'
import { applyFilters, useOrders } from '../../shared/useOrders'
import { useOrderActions } from '../../shared/useOrderActions'
import OrderDetailDrawer from '../../shared/OrderDetailDrawer'
import ScenarioBar from '../../shared/ScenarioBar'

const { RangePicker } = DatePicker

const EMPTY_FILTERS = {
  keyword: '',
  status: undefined,
  dateRange: null,
  channel: undefined,
  payType: undefined,
  riskLevel: undefined
}

function DensePage() {
  const { rows, setRows, loading, error, scenario, setScenario, reload } = useOrders()
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [selectedKeys, setSelectedKeys] = useState([])
  const [detail, setDetail] = useState(null)
  const actions = useOrderActions({ rows, setRows, selectedKeys, setSelectedKeys })

  const set = (patch) => setFilters((f) => ({ ...f, ...patch }))
  const filtered = useMemo(() => applyFilters(rows, filters, dayjs), [rows, filters])

  const activeTags = []
  if (filters.keyword) activeTags.push({ key: 'keyword', label: `关键词：${filters.keyword}` })
  if (filters.status) activeTags.push({ key: 'status', label: `状态：${STATUS_TEXT[filters.status]}` })
  if (filters.dateRange && (filters.dateRange[0] || filters.dateRange[1]))
    activeTags.push({
      key: 'dateRange',
      label: `创建时间：${filters.dateRange[0]?.format('MM-DD') || '…'} ~ ${filters.dateRange[1]?.format('MM-DD') || '…'}`
    })
  if (filters.channel) activeTags.push({ key: 'channel', label: `渠道：${filters.channel}` })
  if (filters.payType) activeTags.push({ key: 'payType', label: `支付：${PAY_TEXT[filters.payType]}` })
  if (filters.riskLevel) activeTags.push({ key: 'riskLevel', label: `风险：${RISK_TEXT[filters.riskLevel]}` })
  const hasFilters = activeTags.length > 0

  const moreFilterContent = (
    <Space direction="vertical" size={8} style={{ width: 220 }}>
      <Select
        placeholder="渠道"
        allowClear
        style={{ width: '100%' }}
        value={filters.channel}
        onChange={(v) => set({ channel: v })}
        options={CHANNELS.map((v) => ({ value: v, label: v }))}
      />
      <Select
        placeholder="支付方式"
        allowClear
        style={{ width: '100%' }}
        value={filters.payType}
        onChange={(v) => set({ payType: v })}
        options={PAY_TYPES.map((v) => ({ value: v, label: PAY_TEXT[v] }))}
      />
      <Select
        placeholder="风险等级"
        allowClear
        style={{ width: '100%' }}
        value={filters.riskLevel}
        onChange={(v) => set({ riskLevel: v })}
        options={RISK_LEVELS.map((v) => ({ value: v, label: RISK_TEXT[v] + '风险' }))}
      />
    </Space>
  )

  const columns = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      width: 140,
      fixed: 'left',
      render: (v, row) => (
        <Typography.Link onClick={() => setDetail(row)} style={{ fontVariantNumeric: 'tabular-nums' }}>
          {v}
        </Typography.Link>
      )
    },
    { title: '客户', dataIndex: 'customerName', width: 90 },
    {
      title: '手机号',
      dataIndex: 'customerPhone',
      width: 120,
      render: (v) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{v}</span>
    },
    {
      title: '金额',
      dataIndex: 'amount',
      width: 110,
      align: 'right',
      sorter: (a, b) => a.amount - b.amount,
      render: (v) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>¥ {fmtMoney(v)}</span>
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (v) => <Tag color={STATUS_COLOR[v]}>{STATUS_TEXT[v]}</Tag>
    },
    {
      title: '渠道/支付',
      dataIndex: 'channel',
      width: 110,
      render: (v, row) => (
        <span style={{ color: 'rgba(0,0,0,.55)', fontSize: 12 }}>
          {v} · {PAY_TEXT[row.payType]}
        </span>
      )
    },
    {
      title: '风险',
      dataIndex: 'riskLevel',
      width: 70,
      render: (v) => (
        <span style={{ color: v === 'LOW' ? 'rgba(0,0,0,.45)' : RISK_COLOR[v], fontSize: 12 }}>
          ● {RISK_TEXT[v]}
        </span>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 135,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (v) => <span style={{ color: 'rgba(0,0,0,.55)', fontSize: 12 }}>{fmtDateTime(v)}</span>
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
          <Button size="small" type="link" onClick={() => actions.urgeShip(row)}>
            催发货
          </Button>
          <Dropdown
            menu={{
              items: [
                { key: 'copy', label: '复制订单号' },
                { type: 'divider' },
                { key: 'blacklist', label: '加入黑名单', danger: true },
                { key: 'remove', label: '删除订单', danger: true }
              ],
              onClick: ({ key }) => {
                if (key === 'copy') actions.copyOrder(row)
                if (key === 'blacklist') actions.blacklist(row)
                if (key === 'remove') actions.removeOrder(row)
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

  return (
    <div style={{ padding: '12px 16px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* 页头：标题 + 全局低频操作 */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>订单管理</h2>
        <span style={{ marginLeft: 12, color: 'rgba(0,0,0,.45)', fontSize: 12 }}>
          商城运营 / 交易 / 订单管理
        </span>
        <Space style={{ marginLeft: 'auto' }}>
          <Button onClick={actions.syncErp}>同步 ERP</Button>
          <Button onClick={() => actions.exportAll(filtered.length)}>导出全部</Button>
        </Space>
      </div>

      {/* 筛选条：高频常驻 + 更多筛选折叠 */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #e8e8e8',
          padding: '10px 12px',
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          flexWrap: 'wrap'
        }}
      >
        <Input
          placeholder="订单号 / 外部交易号 / 客户 / 手机号"
          allowClear
          style={{ width: 260 }}
          value={filters.keyword}
          onChange={(e) => set({ keyword: e.target.value })}
        />
        <Select
          placeholder="状态"
          allowClear
          style={{ width: 110 }}
          value={filters.status}
          onChange={(v) => set({ status: v })}
          options={Object.keys(STATUS_TEXT).map((k) => ({ value: k, label: STATUS_TEXT[k] }))}
        />
        <RangePicker value={filters.dateRange} onChange={(v) => set({ dateRange: v })} style={{ width: 230 }} />
        <Popover content={moreFilterContent} title="更多筛选" trigger="click" placement="bottomLeft">
          <Button>
            更多筛选 <DownOutlined style={{ fontSize: 10 }} />
          </Button>
        </Popover>
        <Button icon={<ReloadOutlined />} onClick={reload}>
          刷新
        </Button>
        {hasFilters && (
          <Button type="link" size="small" onClick={() => setFilters(EMPTY_FILTERS)}>
            重置
          </Button>
        )}
        {hasFilters && (
          <div style={{ width: '100%', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {activeTags.map((t) => (
              <Tag
                key={t.key}
                closable
                onClose={(e) => {
                  e.preventDefault()
                  set({ [t.key]: t.key === 'dateRange' ? null : t.key === 'keyword' ? '' : undefined })
                }}
              >
                {t.label}
              </Tag>
            ))}
          </div>
        )}
      </div>

      {/* 工具栏：批量操作 + 计数 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 0'
        }}
      >
        <span style={{ fontSize: 12, color: 'rgba(0,0,0,.45)' }}>
          {selectedKeys.length > 0 ? `已选 ${selectedKeys.length} 笔` : '未选择订单'}
        </span>
        <Tooltip title={selectedKeys.length ? '' : '先勾选订单，再执行批量操作'}>
          <Button danger disabled={!selectedKeys.length} onClick={actions.batchClose}>
            批量关闭
          </Button>
        </Tooltip>
        {selectedKeys.length > 0 && (
          <Button type="link" size="small" onClick={() => setSelectedKeys([])}>
            取消选择
          </Button>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(0,0,0,.45)' }}>
          共 {filtered.length} 条
        </span>
      </div>

      {error && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 8 }}
          message="订单列表加载失败"
          description={error}
          action={
            <Button size="small" danger onClick={reload}>
              重试
            </Button>
          }
        />
      )}

      {/* 高密度表格 */}
      <div style={{ background: '#fff', border: '1px solid #e8e8e8' }}>
        <Table
          rowKey="id"
          size="small"
          columns={columns}
          dataSource={loading || error ? [] : filtered}
          scroll={{ x: 1050 }}
          sticky
          rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys }}
          locale={{
            emptyText: loading ? (
              <div style={{ padding: '8px 4px', textAlign: 'left' }}>
                <Skeleton active title={false} paragraph={{ rows: 8, width: '100%' }} />
              </div>
            ) : error ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="加载失败，请点击上方「重试」" />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={hasFilters ? '当前筛选条件下没有订单' : '暂无订单'}
              >
                {hasFilters && (
                  <Button size="small" onClick={() => setFilters(EMPTY_FILTERS)}>
                    清空筛选
                  </Button>
                )}
              </Empty>
            )
          }}
          pagination={{ pageSize: 20, size: 'small', showTotal: (t) => `共 ${t} 条` }}
        />
      </div>

      <OrderDetailDrawer order={detail} open={!!detail} onClose={() => setDetail(null)} />
      <ScenarioBar scenario={scenario} onChange={setScenario} />
    </div>
  )
}

export default function EnterpriseDenseVariant() {
  return (
    <ConfigProvider
      locale={zhCN}
      componentSize="small"
      theme={{
        token: {
          borderRadius: 4,
          fontSize: 13,
          colorBgLayout: '#f5f5f5'
        }
      }}
    >
      <App>
        <DensePage />
      </App>
    </ConfigProvider>
  )
}
