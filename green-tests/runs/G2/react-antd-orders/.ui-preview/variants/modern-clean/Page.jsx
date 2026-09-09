import React, { useMemo, useState } from 'react'
import {
  App,
  Avatar,
  Button,
  Card,
  Col,
  ConfigProvider,
  DatePicker,
  Dropdown,
  Empty,
  Input,
  Popover,
  Result,
  Row,
  Select,
  Skeleton,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Typography
} from 'antd'
import { DownloadOutlined, FilterOutlined, MoreOutlined, SyncOutlined } from '@ant-design/icons'
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

const AVATAR_COLORS = ['#5b8ff9', '#5ad8a6', '#f6bd16', '#e8684a', '#6dc8ec', '#9270ca']
const EMPTY_FILTERS = {
  keyword: '',
  dateRange: null,
  channel: undefined,
  payType: undefined,
  riskLevel: undefined
}

const RANGE_PRESETS = [
  { label: '今天', value: [dayjs('2026-06-30'), dayjs('2026-06-30')] },
  { label: '近 7 天', value: [dayjs('2026-06-24'), dayjs('2026-06-30')] },
  { label: '近 30 天', value: [dayjs('2026-06-01'), dayjs('2026-06-30')] }
]

function CleanPage() {
  const { rows, setRows, loading, error, scenario, setScenario, reload } = useOrders()
  const [tab, setTab] = useState('ALL')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [selectedKeys, setSelectedKeys] = useState([])
  const [detail, setDetail] = useState(null)
  const actions = useOrderActions({ rows, setRows, selectedKeys, setSelectedKeys })

  const set = (patch) => setFilters((f) => ({ ...f, ...patch }))
  const filtered = useMemo(
    () => applyFilters(rows, { ...filters, status: tab === 'ALL' ? undefined : tab }, dayjs),
    [rows, filters, tab]
  )

  const stats = useMemo(
    () => ({
      total: rows.length,
      waitPay: rows.filter((r) => r.status === 'WAIT_PAY').length,
      refunding: rows.filter((r) => r.status === 'REFUNDING').length,
      amount: rows.reduce((s, r) => s + r.amount, 0)
    }),
    [rows]
  )

  const countOf = (s) => rows.filter((r) => r.status === s).length
  const hasFilters =
    !!filters.keyword ||
    !!filters.channel ||
    !!filters.payType ||
    !!filters.riskLevel ||
    !!(filters.dateRange && (filters.dateRange[0] || filters.dateRange[1]))

  const filterPanel = (
    <Space direction="vertical" size={12} style={{ width: 240 }}>
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
      <Button block onClick={() => setFilters(EMPTY_FILTERS)}>
        清空筛选
      </Button>
    </Space>
  )

  const columns = [
    {
      title: '订单',
      dataIndex: 'orderNo',
      width: 190,
      render: (v, row) => (
        <div>
          <Typography.Link strong onClick={() => setDetail(row)}>
            {v}
          </Typography.Link>
          <div style={{ color: 'rgba(0,0,0,.4)', fontSize: 12 }}>
            {row.outTradeNo ? `交易号 ${row.outTradeNo}` : '未生成外部交易号'}
          </div>
        </div>
      )
    },
    {
      title: '客户',
      dataIndex: 'customerName',
      width: 170,
      render: (v, row) => (
        <Space>
          <Avatar size={32} style={{ background: AVATAR_COLORS[v.charCodeAt(0) % AVATAR_COLORS.length] }}>
            {v[0]}
          </Avatar>
          <div>
            <div>{v}</div>
            <div style={{ color: 'rgba(0,0,0,.4)', fontSize: 12 }}>{row.customerPhone}</div>
          </div>
        </Space>
      )
    },
    {
      title: '金额',
      dataIndex: 'amount',
      width: 120,
      align: 'right',
      sorter: (a, b) => a.amount - b.amount,
      render: (v, row) => (
        <div>
          <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>¥ {fmtMoney(v)}</span>
          {row.riskLevel !== 'LOW' && (
            <div style={{ fontSize: 12, color: RISK_COLOR[row.riskLevel] }}>{RISK_TEXT[row.riskLevel]}风险</div>
          )}
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v) => (
        <Tag color={STATUS_COLOR[v]} style={{ borderRadius: 999, paddingInline: 10 }}>
          {STATUS_TEXT[v]}
        </Tag>
      )
    },
    {
      title: '渠道 / 支付',
      dataIndex: 'channel',
      width: 110,
      render: (v, row) => (
        <span style={{ color: 'rgba(0,0,0,.55)' }}>
          {v} · {PAY_TEXT[row.payType]}
        </span>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 150,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      render: (v) => <span style={{ color: 'rgba(0,0,0,.55)' }}>{fmtDateTime(v)}</span>
    },
    {
      title: '',
      key: 'action',
      width: 150,
      align: 'right',
      render: (_, row) => (
        <Space size={0}>
          <Button type="link" onClick={() => actions.urgeShip(row)}>
            催发货
          </Button>
          <Dropdown
            menu={{
              items: [
                { key: 'detail', label: '查看详情' },
                { key: 'copy', label: '复制订单号' },
                { type: 'divider' },
                { key: 'blacklist', label: '加入黑名单', danger: true },
                { key: 'remove', label: '删除订单', danger: true }
              ],
              onClick: ({ key }) => {
                if (key === 'detail') setDetail(row)
                if (key === 'copy') actions.copyOrder(row)
                if (key === 'blacklist') actions.blacklist(row)
                if (key === 'remove') actions.removeOrder(row)
              }
            }}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      )
    }
  ]

  return (
    <div style={{ background: '#f5f7fa', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '28px 24px 64px' }}>
        {/* 页头 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>订单管理</h1>
            <div style={{ color: 'rgba(0,0,0,.45)', marginTop: 4 }}>查询、跟进并处理商城全部订单</div>
          </div>
          <Space style={{ marginLeft: 'auto' }}>
            <Button icon={<SyncOutlined />} onClick={actions.syncErp}>
              同步 ERP
            </Button>
            <Button type="primary" icon={<DownloadOutlined />} onClick={() => actions.exportAll(filtered.length)}>
              导出订单
            </Button>
          </Space>
        </div>

        {/* 摘要统计卡 */}
        <Row gutter={16} style={{ marginBottom: 20 }}>
          {[
            { title: '全部订单', value: stats.total },
            { title: '待支付', value: stats.waitPay },
            { title: '退款中', value: stats.refunding },
            { title: '订单总额（元）', value: stats.amount, precision: 2 }
          ].map((s) => (
            <Col span={6} key={s.title}>
              <Card variant="borderless" styles={{ body: { padding: '16px 20px' } }}>
                {loading ? (
                  <Skeleton active paragraph={false} title={{ width: '60%' }} />
                ) : (
                  <Statistic title={s.title} value={s.value} precision={s.precision || 0} />
                )}
              </Card>
            </Col>
          ))}
        </Row>

        {/* 数据卡：页签 + 搜索 + 表格 */}
        <Card variant="borderless" styles={{ body: { paddingTop: 8 } }}>
          <Tabs
            activeKey={tab}
            onChange={(k) => {
              setTab(k)
              setSelectedKeys([])
            }}
            items={[
              { key: 'ALL', label: `全部 ${rows.length ? `(${rows.length})` : ''}` },
              ...Object.keys(STATUS_TEXT).map((k) => ({
                key: k,
                label: `${STATUS_TEXT[k]}${rows.length ? ` (${countOf(k)})` : ''}`
              }))
            ]}
          />
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '4px 0 16px' }}>
            <Input.Search
              placeholder="搜索订单号 / 外部交易号 / 客户姓名 / 手机号"
              allowClear
              style={{ width: 360 }}
              value={filters.keyword}
              onChange={(e) => set({ keyword: e.target.value })}
            />
            <RangePicker
              presets={RANGE_PRESETS}
              value={filters.dateRange}
              onChange={(v) => set({ dateRange: v })}
            />
            <Popover content={filterPanel} title="更多筛选" trigger="click" placement="bottomRight">
              <Button icon={<FilterOutlined />}>
                筛选{' '}
                {[filters.channel, filters.payType, filters.riskLevel].filter(Boolean).length > 0 &&
                  `(${[filters.channel, filters.payType, filters.riskLevel].filter(Boolean).length})`}
              </Button>
            </Popover>
            <span style={{ alignSelf: 'center', color: 'rgba(0,0,0,.45)', marginLeft: 'auto' }}>
              共 {filtered.length} 条
            </span>
          </div>

          {selectedKeys.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: '#f0f5ff',
                border: '1px solid #d6e4ff',
                borderRadius: 10,
                padding: '8px 16px',
                marginBottom: 12
              }}
            >
              <span>已选择 {selectedKeys.length} 笔订单</span>
              <Button danger size="small" onClick={actions.batchClose}>
                批量关闭
              </Button>
              <Button size="small" type="text" onClick={() => setSelectedKeys([])}>
                取消选择
              </Button>
            </div>
          )}

          {loading ? (
            <Skeleton active paragraph={{ rows: 10 }} />
          ) : error ? (
            <Result
              status="error"
              title="订单加载失败"
              subTitle={error}
              extra={
                <Button type="primary" onClick={reload}>
                  重新加载
                </Button>
              }
            />
          ) : (
            <Table
              rowKey="id"
              columns={columns}
              dataSource={filtered}
              rowSelection={{ selectedRowKeys: selectedKeys, onChange: setSelectedKeys }}
              locale={{
                emptyText: (
                  <Empty
                    style={{ padding: '32px 0' }}
                    description={
                      hasFilters || tab !== 'ALL' ? '没有符合条件的订单，试试放宽筛选' : '还没有订单'
                    }
                  >
                    {(hasFilters || tab !== 'ALL') && (
                      <Button
                        onClick={() => {
                          setFilters(EMPTY_FILTERS)
                          setTab('ALL')
                        }}
                      >
                        清空筛选
                      </Button>
                    )}
                  </Empty>
                )
              }}
              pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
            />
          )}
        </Card>
      </div>

      <OrderDetailDrawer order={detail} open={!!detail} onClose={() => setDetail(null)} width={520} />
      <ScenarioBar scenario={scenario} onChange={setScenario} />
    </div>
  )
}

export default function ModernCleanVariant() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          borderRadius: 10,
          colorPrimary: '#4e6ef2',
          colorBgLayout: '#f5f7fa',
          fontSize: 14
        },
        components: {
          Card: { boxShadowTertiary: '0 1px 2px rgba(16,24,40,.04), 0 2px 8px rgba(16,24,40,.06)' }
        }
      }}
    >
      <App>
        <CleanPage />
      </App>
    </ConfigProvider>
  )
}
